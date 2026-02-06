-- Criar trigger para reset mensal de créditos
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  last_reset TIMESTAMP;
  credits_by_plan INTEGER;
BEGIN
  -- Verificar última reset
  last_reset := OLD.ai_credits_last_reset;
  
  -- Se passou mais de 30 dias desde o último reset
  IF last_reset IS NULL OR (now() - last_reset) > interval '30 days' THEN
    -- Definir créditos baseado no plano (será determinado pela subscription)
    credits_by_plan := COALESCE(NEW.ai_credits_total, 100);
    
    NEW.ai_credits_remaining := credits_by_plan;
    NEW.ai_credits_last_reset := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para verificar reset de créditos em cada acesso
DROP TRIGGER IF EXISTS check_credits_reset ON company_profiles;
CREATE TRIGGER check_credits_reset
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION reset_monthly_credits();

-- Criar função para decrementar créditos
CREATE OR REPLACE FUNCTION public.decrement_ai_credits(user_uuid UUID, amount INTEGER DEFAULT 1)
RETURNS TABLE(success BOOLEAN, remaining INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
  new_credits INTEGER;
BEGIN
  -- Verificar créditos atuais
  SELECT ai_credits_remaining INTO current_credits
  FROM company_profiles
  WHERE user_id = user_uuid;
  
  IF current_credits IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'Perfil não encontrado'::TEXT;
    RETURN;
  END IF;
  
  IF current_credits < amount THEN
    RETURN QUERY SELECT FALSE, current_credits, 'Créditos insuficientes'::TEXT;
    RETURN;
  END IF;
  
  -- Decrementar créditos
  new_credits := current_credits - amount;
  
  UPDATE company_profiles
  SET ai_credits_remaining = new_credits
  WHERE user_id = user_uuid;
  
  RETURN QUERY SELECT TRUE, new_credits, 'Sucesso'::TEXT;
END;
$$;

-- Criar função para adicionar créditos (para admin ou upgrades)
CREATE OR REPLACE FUNCTION public.add_ai_credits(user_uuid UUID, amount INTEGER, new_total INTEGER DEFAULT NULL)
RETURNS TABLE(success BOOLEAN, remaining INTEGER, total INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_remaining INTEGER;
  current_total INTEGER;
BEGIN
  SELECT ai_credits_remaining, ai_credits_total INTO current_remaining, current_total
  FROM company_profiles
  WHERE user_id = user_uuid;
  
  IF current_remaining IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 0;
    RETURN;
  END IF;
  
  -- Atualizar créditos
  UPDATE company_profiles
  SET 
    ai_credits_remaining = COALESCE(current_remaining, 0) + amount,
    ai_credits_total = COALESCE(new_total, current_total)
  WHERE user_id = user_uuid;
  
  RETURN QUERY SELECT TRUE, current_remaining + amount, COALESCE(new_total, current_total);
END;
$$;

-- Atualizar subscription para permitir insert pelo próprio usuário (para criar plano inicial)
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
CREATE POLICY "Users can insert own subscription"
ON subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);