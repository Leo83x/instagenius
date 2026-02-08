import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export interface TextStyleConfig {
    position: 'top' | 'center' | 'bottom';
    color: string;
    strokeColor: string;
    fontSize: number; // percentage (0.04 - 0.10)
    fontFamily: string;
<<<<<<< HEAD
    text: string;
=======
    text: string; // NEW: editable text
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
}

interface TextOverlayEditorProps {
    imageUrl: string;
    text: string;
    initialPosition?: 'top' | 'center' | 'bottom';
    onApply: (config: TextStyleConfig) => void;
    onCancel: () => void;
}

const FONT_FAMILIES = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Impact, sans-serif', label: 'Impact' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
];

export function TextOverlayEditor({
    imageUrl,
    text,
    initialPosition = 'center',
    onApply,
    onCancel
}: TextOverlayEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<TextStyleConfig>({
        position: initialPosition,
        color: '#FFFFFF',
        strokeColor: '#000000',
        fontSize: 0.06,
        fontFamily: 'Arial, sans-serif',
<<<<<<< HEAD
        text: text
    });

=======
        text: text // Initialize with provided text
    });

    // Helper function to wrap text
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
    const wrapText = (
        ctx: CanvasRenderingContext2D,
        text: string,
        maxWidth: number
    ): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

<<<<<<< HEAD
=======
    // Render preview
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
    const renderPreview = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
<<<<<<< HEAD
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

=======
            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Calculate font size
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            const fontSize = Math.floor(img.height * config.fontSize);
            ctx.font = `bold ${fontSize}px ${config.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

<<<<<<< HEAD
            const maxWidth = img.width * 0.8;

=======
            // Calculate max width
            const maxWidth = img.width * 0.8;

            // Wrap text - use config.text instead of prop text
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            const lines = wrapText(ctx, config.text.toUpperCase(), maxWidth).slice(0, 3);
            const lineHeight = fontSize * 1.3;
            const totalTextHeight = lines.length * lineHeight;

<<<<<<< HEAD
=======
            // Calculate Y position
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            let startY: number;
            const padding = img.height * 0.1;

            switch (config.position) {
                case 'top':
                    startY = padding + fontSize / 2;
                    break;
                case 'bottom':
                    startY = img.height - padding - totalTextHeight + fontSize / 2;
                    break;
                case 'center':
                default:
                    startY = (img.height - totalTextHeight) / 2 + fontSize / 2;
                    break;
            }

<<<<<<< HEAD
=======
            // Draw each line
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            lines.forEach((line, index) => {
                const y = startY + index * lineHeight;
                const x = img.width / 2;

<<<<<<< HEAD
=======
                // Shadow
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;

<<<<<<< HEAD
=======
                // Stroke
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                ctx.strokeStyle = config.strokeColor;
                ctx.lineWidth = fontSize * 0.08;
                ctx.strokeText(line, x, y);

<<<<<<< HEAD
=======
                // Reset shadow
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

<<<<<<< HEAD
=======
                // Fill
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                ctx.fillStyle = config.color;
                ctx.fillText(line, x, y);
            });

            setLoading(false);
        };

        img.onerror = () => {
            setLoading(false);
        };

        img.src = imageUrl;
    };

<<<<<<< HEAD
    useEffect(() => {
        renderPreview();
    }, [config, imageUrl]);
=======
    // Re-render when config changes
    useEffect(() => {
        renderPreview();
    }, [config, imageUrl]); // Removed 'text' dependency since we use config.text
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6

    const handleApply = () => {
        onApply(config);
    };

    return (
        <Dialog open onOpenChange={onCancel}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
<<<<<<< HEAD
                    <DialogTitle>Edit Text on Image</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
=======
                    <DialogTitle>Editar Texto na Imagem</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Preview */}
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                    <div className="relative bg-muted rounded-lg overflow-hidden">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        )}
                        <canvas
                            ref={canvasRef}
                            className="w-full h-auto"
                            style={{ maxHeight: '400px', objectFit: 'contain' }}
                        />
                    </div>

<<<<<<< HEAD
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="textContent">Text</Label>
=======
                    {/* Controls */}
                    <div className="space-y-4">
                        {/* Editable Text */}
                        <div>
                            <Label htmlFor="textContent">Texto</Label>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                            <div className="relative">
                                <Input
                                    id="textContent"
                                    type="text"
                                    value={config.text}
                                    onChange={(e) => setConfig({ ...config, text: e.target.value })}
<<<<<<< HEAD
                                    placeholder="Type text..."
=======
                                    placeholder="Digite o texto..."
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                                    maxLength={50}
                                    className="mt-1 pr-16"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    {config.text.length}/50
                                </span>
                            </div>
                        </div>

<<<<<<< HEAD
                        <div>
                            <Label className="mb-2 block">Position</Label>
=======
                        {/* Position */}
                        <div>
                            <Label className="mb-2 block">Posição</Label>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                            <div className="flex gap-2">
                                <Button
                                    variant={config.position === 'top' ? 'default' : 'outline'}
                                    onClick={() => setConfig({ ...config, position: 'top' })}
                                    className="flex-1"
                                >
<<<<<<< HEAD
                                    Top
=======
                                    Topo
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                                </Button>
                                <Button
                                    variant={config.position === 'center' ? 'default' : 'outline'}
                                    onClick={() => setConfig({ ...config, position: 'center' })}
                                    className="flex-1"
                                >
<<<<<<< HEAD
                                    Center
=======
                                    Centro
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                                </Button>
                                <Button
                                    variant={config.position === 'bottom' ? 'default' : 'outline'}
                                    onClick={() => setConfig({ ...config, position: 'bottom' })}
                                    className="flex-1"
                                >
<<<<<<< HEAD
                                    Bottom
=======
                                    Rodapé
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                                </Button>
                            </div>
                        </div>

<<<<<<< HEAD
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="textColor">Text Color</Label>
=======
                        {/* Colors */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="textColor">Cor do Texto</Label>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        id="textColor"
                                        type="color"
                                        value={config.color}
                                        onChange={(e) => setConfig({ ...config, color: e.target.value })}
                                        className="w-16 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={config.color}
                                        onChange={(e) => setConfig({ ...config, color: e.target.value })}
                                        placeholder="#FFFFFF"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div>
<<<<<<< HEAD
                                <Label htmlFor="strokeColor">Outline Color</Label>
=======
                                <Label htmlFor="strokeColor">Cor do Contorno</Label>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        id="strokeColor"
                                        type="color"
                                        value={config.strokeColor}
                                        onChange={(e) => setConfig({ ...config, strokeColor: e.target.value })}
                                        className="w-16 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={config.strokeColor}
                                        onChange={(e) => setConfig({ ...config, strokeColor: e.target.value })}
                                        placeholder="#000000"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>

<<<<<<< HEAD
                        <div>
                            <Label>Size: {Math.round(config.fontSize * 100)}%</Label>
=======
                        {/* Font Size */}
                        <div>
                            <Label>Tamanho: {Math.round(config.fontSize * 100)}%</Label>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                            <Slider
                                value={[config.fontSize * 100]}
                                onValueChange={(value) => setConfig({ ...config, fontSize: value[0] / 100 })}
                                min={4}
                                max={10}
                                step={0.5}
                                className="mt-2"
                            />
                        </div>

<<<<<<< HEAD
                        <div>
                            <Label htmlFor="fontFamily">Font</Label>
=======
                        {/* Font Family */}
                        <div>
                            <Label htmlFor="fontFamily">Fonte</Label>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                            <Select
                                value={config.fontFamily}
                                onValueChange={(value) => setConfig({ ...config, fontFamily: value })}
                            >
                                <SelectTrigger id="fontFamily" className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FONT_FAMILIES.map((font) => (
                                        <SelectItem key={font.value} value={font.value}>
                                            {font.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

<<<<<<< HEAD
                        {config.text.length > 30 && (
                            <p className="text-xs text-muted-foreground">
                                💡 Long texts will be broken into multiple lines automatically
=======
                        {/* Info */}
                        {config.text.length > 30 && (
                            <p className="text-xs text-muted-foreground">
                                💡 Textos longos serão quebrados em múltiplas linhas automaticamente
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                            </p>
                        )}
                    </div>

<<<<<<< HEAD
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleApply} className="bg-gradient-to-r from-primary to-purple-600">
                            Apply Text
=======
                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button onClick={handleApply} className="btn-shimmer">
                            Aplicar Texto
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
