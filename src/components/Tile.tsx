import "./Tile.scss";
import { useState, useEffect, useRef } from "react";

export type Piece = "#" | "r" | "n" | "b" | "q" | "k" | "p" | "R" | "N" | "B" | "Q" | "K" | "P";
export interface TileProps {
    src: string;
    setFen: (values: string) => void;
}

const Tile: React.FC<TileProps> = ({ src, setFen }) => {

    const [pieceHeld, setPieceHeld] = useState<HTMLElement | null>(null);
    const pieceRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<boolean>(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (dragging && pieceHeld) {
                let x = e.clientX - pieceHeld.clientWidth / 2;
                let y = e.clientY - pieceHeld.clientHeight / 2;
                x = Math.max(0, Math.min(x, window.innerWidth - pieceHeld.clientWidth));
                y = Math.max(0, Math.min(y, window.innerHeight - pieceHeld.clientHeight));
                pieceHeld.style.left = `${x}px`;
                pieceHeld.style.top = `${y}px`;
                pieceHeld.style.position = "absolute";
                pieceHeld.style.zIndex = `1000`;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [pieceHeld, dragging]);

    const grabPiece: (e: React.MouseEvent) => void = (e) => {
        const element = e.target as HTMLElement;
        const x = e.clientX - element.clientWidth / 2;
        const y = e.clientY - element.clientHeight / 2;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.position = "absolute";
        element.style.zIndex = `1000`;
        setPieceHeld(element);
        setDragging(true);
    }

    const dropPiece: (e: React.MouseEvent) => void = (e) => {
        const element = e.currentTarget as HTMLElement;
        if (dragging) {
            setPieceHeld(null);
            setDragging(false);
            setFen("3k4/4p3/3pPp2/b1pP1Pp1/1pP3Pp/pP5P/P7/4K3 w - - 0 1");
        }
    };

    return (
        <div
            ref={pieceRef}
            className="piece"
            style={{ backgroundImage: `url(${src})` }}
            onMouseDown={(e) => grabPiece(e)}
            onMouseUp={(e) => dropPiece(e)}
        />
    );
};

export default Tile;