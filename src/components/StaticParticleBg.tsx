"use client";

import { useEffect, useRef } from "react";

interface StaticGridNetworkProps {
    spacing?: number;
    jitter?: number;
    connectDiagonals?: boolean;
    dotRadius?: number;
    dotColor?: string;
    lineColor?: string;
    /** Opacity at the very center of the screen (0 = completely invisible, 1 = no fade) */
    centerOpacity?: number;
    /** Percentage of the screen radius where the grid reaches full outer opacity (e.g., 55) */
    fadeRadius?: number;
}

export default function StaticGridNetwork({
    spacing = 70,
    jitter = 0,
    connectDiagonals = false,
    dotRadius = 2,
    dotColor = "rgba(56, 189, 248, 0.75)",
    lineColor = "rgba(56, 189, 248, 0.18)",
    centerOpacity = 0.15,
    fadeRadius = 55,
}: StaticGridNetworkProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const drawGridNetwork = () => {
            const dpr = window.devicePixelRatio || 1;
            const width = window.innerWidth;
            const height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, width, height);

            const cols = Math.ceil(width / spacing) + 1;
            const rows = Math.ceil(height / spacing) + 1;

            const grid: { x: number; y: number }[][] = [];

            for (let r = 0; r < rows; r++) {
                const rowNodes: { x: number; y: number }[] = [];
                for (let c = 0; c < cols; c++) {
                    const offsetX = jitter ? (Math.random() - 0.5) * jitter : 0;
                    const offsetY = jitter ? (Math.random() - 0.5) * jitter : 0;

                    rowNodes.push({
                        x: c * spacing + offsetX,
                        y: r * spacing + offsetY,
                    });
                }
                grid.push(rowNodes);
            }

            // Draw connecting lines
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const current = grid[r][c];

                    if (c + 1 < cols) {
                        ctx.beginPath();
                        ctx.moveTo(current.x, current.y);
                        ctx.lineTo(grid[r][c + 1].x, grid[r][c + 1].y);
                        ctx.stroke();
                    }

                    if (r + 1 < rows) {
                        ctx.beginPath();
                        ctx.moveTo(current.x, current.y);
                        ctx.lineTo(grid[r + 1][c].x, grid[r + 1][c].y);
                        ctx.stroke();
                    }

                    if (connectDiagonals && r + 1 < rows && c + 1 < cols) {
                        ctx.beginPath();
                        ctx.moveTo(current.x, current.y);
                        ctx.lineTo(grid[r + 1][c + 1].x, grid[r + 1][c + 1].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw static dots
            ctx.fillStyle = dotColor;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const node = grid[r][c];
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, dotRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        drawGridNetwork();
        window.addEventListener("resize", drawGridNetwork);

        return () => window.removeEventListener("resize", drawGridNetwork);
    }, [spacing, jitter, connectDiagonals, dotRadius, dotColor, lineColor]);

    // Clamp values to safe ranges
    const safeOpacity = Math.max(0, Math.min(1, centerOpacity));
    const safeRadius = Math.max(10, Math.min(100, fadeRadius));

    // Radial mask: faded at center, full strength toward the edges
    const maskGradient = `radial-gradient(circle at center, rgba(0, 0, 0, ${safeOpacity}) 0%, rgba(0, 0, 0, 1) ${safeRadius}%)`;

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                zIndex: -1,
                pointerEvents: "none",
                maskImage: maskGradient,
                WebkitMaskImage: maskGradient,
            }}
        />
    );
}
