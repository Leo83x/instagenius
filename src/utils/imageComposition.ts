/**
 * Helper function to wrap text to fit within a given width
 */
function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
): string[] {
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
}

/**
 * Composes text overlay onto an image using Canvas API
<<<<<<< HEAD
=======
 * @param imageUrl - URL of the base image
 * @param text - Text to overlay on the image
 * @param position - Position of the text ('top' | 'center' | 'bottom')
 * @param textStyle - Optional styling options
 * @returns Promise<string> - Data URL of the composed image
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
 */
export async function composeTextOnImage(
    imageUrl: string,
    text: string,
    position: 'top' | 'center' | 'bottom' = 'center',
    textStyle?: {
        fontFamily?: string;
        color?: string;
        strokeColor?: string;
        fontSize?: number; // percentage (0.04 - 0.10)
        maxLines?: number;
    }
): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

<<<<<<< HEAD
=======
        // Load base image
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
        const baseImage = new Image();
        baseImage.crossOrigin = 'anonymous';

        baseImage.onload = () => {
<<<<<<< HEAD
            canvas.width = baseImage.width;
            canvas.height = baseImage.height;

            ctx.drawImage(baseImage, 0, 0);

=======
            // Set canvas size to match image
            canvas.width = baseImage.width;
            canvas.height = baseImage.height;

            // Draw base image
            ctx.drawImage(baseImage, 0, 0);

            // Calculate responsive font size (default 6% of image height)
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            const fontSizePercent = textStyle?.fontSize || 0.06;
            const fontSize = Math.floor(baseImage.height * fontSizePercent);
            const fontFamily = textStyle?.fontFamily || 'Arial, sans-serif';
            const textColor = textStyle?.color || '#FFFFFF';
            const strokeColor = textStyle?.strokeColor || '#000000';
            const maxLines = textStyle?.maxLines || 3;

<<<<<<< HEAD
=======
            // Set font
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

<<<<<<< HEAD
            const maxWidth = baseImage.width * 0.8;
=======
            // Calculate max width (80% of image width)
            const maxWidth = baseImage.width * 0.8;

            // Wrap text
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            const lines = wrapText(ctx, text.toUpperCase(), maxWidth).slice(0, maxLines);
            const lineHeight = fontSize * 1.3;
            const totalTextHeight = lines.length * lineHeight;

<<<<<<< HEAD
            let startY: number;
            const padding = baseImage.height * 0.1;
=======
            // Calculate Y position based on position parameter
            let startY: number;
            const padding = baseImage.height * 0.1; // 10% padding
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6

            switch (position) {
                case 'top':
                    startY = padding + fontSize / 2;
                    break;
                case 'bottom':
                    startY = baseImage.height - padding - totalTextHeight + fontSize / 2;
                    break;
                case 'center':
                default:
                    startY = (baseImage.height - totalTextHeight) / 2 + fontSize / 2;
                    break;
            }

<<<<<<< HEAD
=======
            // Draw each line with shadow and stroke for better visibility
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            lines.forEach((line, index) => {
                const y = startY + index * lineHeight;
                const x = baseImage.width / 2;

<<<<<<< HEAD
=======
                // Shadow for depth
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;

<<<<<<< HEAD
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = fontSize * 0.08;
                ctx.strokeText(line, x, y);

=======
                // Stroke (outline) for contrast
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = fontSize * 0.08; // 8% of font size
                ctx.strokeText(line, x, y);

                // Reset shadow for fill
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

<<<<<<< HEAD
=======
                // Fill text
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                ctx.fillStyle = textColor;
                ctx.fillText(line, x, y);
            });

<<<<<<< HEAD
=======
            // Convert to data URL
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            resolve(canvas.toDataURL('image/png', 0.95));
        };

        baseImage.onerror = () => {
            reject(new Error('Failed to load base image'));
        };

        baseImage.src = imageUrl;
    });
}

/**
 * Composes a logo onto an image using Canvas API
<<<<<<< HEAD
=======
 * @param imageUrl - URL of the base image
 * @param logoUrl - URL of the logo to overlay
 * @param position - Position of the logo (default: bottom-right)
 * @param size - Size of the logo as percentage of image width (default: 15%)
 * @returns Promise<string> - Data URL of the composed image
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
 */
export async function composeLogoOnImage(
    imageUrl: string,
    logoUrl: string,
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right',
    size: number = 0.15
): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

<<<<<<< HEAD
=======
        // Load base image
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
        const baseImage = new Image();
        baseImage.crossOrigin = 'anonymous';

        baseImage.onload = () => {
<<<<<<< HEAD
            canvas.width = baseImage.width;
            canvas.height = baseImage.height;

            ctx.drawImage(baseImage, 0, 0);

=======
            // Set canvas size to match image
            canvas.width = baseImage.width;
            canvas.height = baseImage.height;

            // Draw base image
            ctx.drawImage(baseImage, 0, 0);

            // Load and draw logo
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            const logoImage = new Image();
            logoImage.crossOrigin = 'anonymous';

            logoImage.onload = () => {
<<<<<<< HEAD
                const logoSize = baseImage.width * size;
                const padding = 20;

=======
                // Calculate logo size (15% of image width by default)
                const logoSize = baseImage.width * size;
                const padding = 20;

                // Calculate position
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                let x = 0;
                let y = 0;

                switch (position) {
                    case 'bottom-right':
                        x = baseImage.width - logoSize - padding;
                        y = baseImage.height - logoSize - padding;
                        break;
                    case 'bottom-left':
                        x = padding;
                        y = baseImage.height - logoSize - padding;
                        break;
                    case 'top-right':
                        x = baseImage.width - logoSize - padding;
                        y = padding;
                        break;
                    case 'top-left':
                        x = padding;
                        y = padding;
                        break;
                }

<<<<<<< HEAD
=======
                // Draw logo with slight shadow for better visibility
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                ctx.drawImage(logoImage, x, y, logoSize, logoSize);

<<<<<<< HEAD
=======
                // Convert to data URL
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                resolve(canvas.toDataURL('image/png', 0.95));
            };

            logoImage.onerror = () => {
                reject(new Error('Failed to load logo image'));
            };

            logoImage.src = logoUrl;
        };

        baseImage.onerror = () => {
            reject(new Error('Failed to load base image'));
        };

        baseImage.src = imageUrl;
    });
}

/**
 * Uploads a composed image to Supabase Storage
<<<<<<< HEAD
=======
 * @param dataUrl - Data URL of the image
 * @param userId - User ID for file path
 * @param supabase - Supabase client
 * @returns Promise<string> - Public URL of uploaded image
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
 */
export async function uploadComposedImage(
    dataUrl: string,
    userId: string,
    supabase: any
): Promise<string> {
<<<<<<< HEAD
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const fileName = `${crypto.randomUUID()}.png`;
    const filePath = `${userId}/composed/${fileName}`;

    const { error } = await supabase.storage
=======
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Generate unique filename
    const fileName = `${crypto.randomUUID()}.png`;
    const filePath = `${userId}/composed/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
        .from('generated-images')
        .upload(filePath, blob, {
            contentType: 'image/png',
            upsert: false
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

<<<<<<< HEAD
=======
    // Get public URL
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
    const { data: urlData } = supabase.storage
        .from('generated-images')
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}
