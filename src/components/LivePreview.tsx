import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useMemo, useState, useEffect } from "react";

interface LivePreviewProps {
    caption: string;
    hashtags?: string[];
    imageUrl?: string;
    supabaseUrl?: string; // NEW
    companyName?: string;
    companyLogo?: string;
    postType?: "feed" | "story" | "reel";
}

export function LivePreview({
    caption,
    hashtags = [],
    imageUrl,
    supabaseUrl,
    companyName = "Sua Empresa",
    companyLogo,
    postType = "feed"
}: LivePreviewProps) {
    // Debounce para evitar updates excessivos
    const debouncedCaption = useDebounce(caption, 300);
    const debouncedHashtags = useDebounce(hashtags, 300);

    // Define aspect ratio e label baseado no tipo de post
    const aspectRatio = postType === "feed" ? "aspect-square" : "aspect-[9/16]";
    const postTypeLabel = postType === "feed" ? "Feed" : postType === "story" ? "Story" : "Reel";
    const maxWidth = postType === "feed" ? "max-w-md" : "max-w-sm";

    // Calcula estatísticas
    const stats = useMemo(() => {
        const captionLength = debouncedCaption.length;
        const hashtagCount = debouncedHashtags.length;
        const totalLength = captionLength + debouncedHashtags.join(' ').length;
        const isOverLimit = totalLength > 2200;

        return {
            captionLength,
            hashtagCount,
            totalLength,
            isOverLimit,
            remaining: 2200 - totalLength,
        };
    }, [debouncedCaption, debouncedHashtags]);

    // Formata caption com hashtags
    const fullCaption = useMemo(() => {
        const hashtagsText = debouncedHashtags.length > 0
            ? '\n\n' + debouncedHashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
            : '';
        return debouncedCaption + hashtagsText;
    }, [debouncedCaption, debouncedHashtags]);

    const [currentImage, setCurrentImage] = useState<string | undefined>(imageUrl);

    useEffect(() => {
        setCurrentImage(imageUrl);
    }, [imageUrl]);

    const handleImageError = () => {
        console.warn("LivePreview: Image error, triggering fallback chain...");
        if (currentImage === imageUrl && supabaseUrl && supabaseUrl !== imageUrl) {
            console.log("LivePreview: Falling back to Supabase...");
            setCurrentImage(supabaseUrl);
        } else if (currentImage && !currentImage.includes('images.unsplash.com')) {
            console.log("LivePreview: Falling back to Emergency Unsplash...");
            const query = encodeURIComponent(caption || "marketing");
            setCurrentImage(`https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&q=80&q=fallback&term=${query}`);
        } else {
            console.error("LivePreview: All image fallbacks failed.");
        }
    };

    return (
        <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    Preview em Tempo Real - {postTypeLabel}
                </h3>
                <Badge variant={stats.isOverLimit ? "destructive" : "secondary"}>
                    {stats.remaining} caracteres restantes
                </Badge>
            </div>

            {/* Simulação do Instagram */}
            <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-900 ${maxWidth} mx-auto`}>
                {/* Header do post */}
                <div className="flex items-center gap-3 p-3 border-b">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                        {companyLogo ? (
                            <img src={companyLogo} alt={companyName} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-sm">
                                {companyName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{companyName}</p>
                        <p className="text-xs text-gray-500">Agora</p>
                    </div>
                </div>

                {/* Imagem do post - aspect ratio dinâmico */}
                {currentImage ? (
                    <div className={`${aspectRatio} bg-gray-100 dark:bg-gray-800`}>
                        <img
                            src={currentImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                        />
                    </div>
                ) : (
                    <div className={`${aspectRatio} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center`}>
                        <div className="text-center text-gray-400">
                            <Instagram className="h-16 w-16 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Imagem do {postTypeLabel.toLowerCase()}</p>
                            <p className="text-xs mt-1">
                                {postType === "feed" ? "1080x1080px (1:1)" : "1080x1920px (9:16)"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Ações do post */}
                <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Heart className="h-6 w-6 cursor-pointer hover:text-red-500 transition-colors" />
                            <MessageCircle className="h-6 w-6 cursor-pointer hover:text-gray-600 transition-colors" />
                            <Send className="h-6 w-6 cursor-pointer hover:text-gray-600 transition-colors" />
                        </div>
                        <Bookmark className="h-6 w-6 cursor-pointer hover:text-gray-600 transition-colors" />
                    </div>

                    {/* Caption */}
                    {fullCaption && (
                        <div className="text-sm">
                            <span className="font-semibold">{companyName}</span>{' '}
                            <span className="whitespace-pre-wrap break-words">
                                {fullCaption}
                            </span>
                        </div>
                    )}

                    {/* Placeholder para comentários */}
                    <p className="text-xs text-gray-500">Ver todos os comentários</p>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                    <p className="text-2xl font-bold">{stats.captionLength}</p>
                    <p className="text-xs text-muted-foreground">Caracteres</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold">{stats.hashtagCount}</p>
                    <p className="text-xs text-muted-foreground">Hashtags</p>
                </div>
                <div className="text-center">
                    <p className={`text-2xl font-bold ${stats.isOverLimit ? 'text-destructive' : ''}`}>
                        {stats.totalLength}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                </div>
            </div>

            {stats.isOverLimit && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive font-medium">
                        ⚠️ Atenção: O texto excede o limite de 2200 caracteres do Instagram
                    </p>
                </div>
            )}
        </Card>
    );
}
