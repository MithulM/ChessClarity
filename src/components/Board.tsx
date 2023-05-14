import React, { useState, useEffect, useRef } from "react";
import "./Board.scss"
import b from '../../assets/Black_Bishop.svg'
import k from '../../assets/Black_King.svg'
import n from '../../assets/Black_Knight.svg'
import p from '../../assets/Black_Pawn.svg'
import q from '../../assets/Black_Queen.svg'
import r from '../../assets/Black_Rook.svg'
import B from '../../assets/White_Bishop.svg'
import K from '../../assets/White_King.svg'
import N from '../../assets/White_Knight.svg'
import P from '../../assets/White_Pawn.svg'
import Q from '../../assets/White_Queen.svg'
import R from '../../assets/White_Rook.svg'


export type Piece = "#" | "r" | "n" | "b" | "q" | "k" | "p" | "R" | "N" | "B" | "Q" | "K" | "P";

const ChessBoard = () => {

  const rows = 8;
  const cols = 8;

  const pieces: { [key: string]: string } = {
    "#": "",
    "r": r,
    "n": n,
    "b": b,
    "q": q,
    "k": k,
    "p": p,
    "R": R,
    "N": N,
    "B": B,
    "Q": Q,
    "K": K,
    "P": P
  };

  const [pieceHeld, setPieceHeld] = useState<HTMLElement | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [grabLoc, setGrabLoc] = useState<[number, number]>([-1, -1]);
  const boardRef = useRef<HTMLDivElement>(null);

  // Position datas
  const [board, setBoard] = useState<Piece[][]>([
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
  ]);
  const [turn, setTurn] = useState(true);
  const [castleK, setCastleK] = useState(true);
  const [castleQ, setCastleQ] = useState(true);
  const [castlek, setCastlek] = useState(true);
  const [castleq, setCastleq] = useState(true);
  const [enPassant, setEnPassant] = useState("-");
  const [halfMoves, setHalfMoves] = useState(0);
  const [fullMoves, setFullMoves] = useState(0);
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0");

  useEffect(() => {
    const [position, turn, castle, enPassantLoc, halfmoves, fullmoves] = fen.split(" ");
    let tempBoard: Piece[][] = [[], [], [], [], [], [], [], []];
    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        tempBoard[x].push("#");
      }
    }
    let rowFen = position.split("/");
    rowFen.forEach((r, x) => {
      let y = 0;
      r.split("").forEach(c => {
        if (!isNaN(Number(c))) {
          y += Number(c);
        } else {
          tempBoard[x][y] = c as Piece;
          y += 1;
        }
      })
    })
    setBoard(tempBoard);
    setTurn(true);
    setCastleK(false);
    setCastleQ(false);
    setCastlek(false);
    setCastleq(false);
    if (castle !== "-") {
      for (const c of castle.split("")) {
        if (c === "K")
          setCastleK(true);
        if (c === "Q")
          setCastleQ(true);
        if (c === "k")
          setCastlek(true);
        if (c === "q")
          setCastleq(true);
      }
    }
    setEnPassant(enPassantLoc);
    setHalfMoves(Number(halfmoves));
    setFullMoves(Number(fullmoves));
  }, [fen]);

  useEffect(() => {
    // update turn
    // * check for legal moves
    // * check for checkmate, stalemate
    // update castling rights
    // update enPassant
    // update halfMoves
    // update fullMoves
    let newFen = "";
    for (const row of board) {
      let s = "";
      let empty = 0;
      for (const square of row) {
        if (square === "#") {
          empty += 1;
        } else {
          s = s.concat(empty === 0 ? square : String(empty) + square);
          empty = 0;
        }
      }
      if (empty !== 0) {
        s = s.concat(empty.toString());
        empty = 0;
      }
      newFen += s + "/";
    }
    newFen = newFen.slice(0, -1);
    newFen += " ";
    newFen += (turn) ? "w" : "b";
    newFen += " ";
    newFen += (castleK ? "K" : "");
    newFen += (castleQ ? "Q" : "");
    newFen += (castlek ? "k" : "");
    newFen += (castleq ? "q" : "");
    newFen += " ";
    newFen += enPassant;
    newFen += " ";
    newFen += halfMoves;
    newFen += " ";
    newFen += fullMoves;
    console.log(newFen);
    setFen(newFen);
  }, [board]);

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

  const grabPiece: (e: React.MouseEvent, coordX: number, coordY: number) => void = (e, coordX, coordY) => {
    e.preventDefault();
    const element = e.target as HTMLElement;
    const x = e.clientX - element.clientWidth / 2;
    const y = e.clientY - element.clientHeight / 2;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.position = "absolute";
    element.style.zIndex = `1000`;
    setPieceHeld(element);
    setGrabLoc([coordX, coordY]);
    setDragging(true);
  }

  const updatePiece: (e: React.DragEvent, x: number, y: number) => void = (e, x, y) => {
    console.log(x, y);
    if (dragging && pieceHeld) {
      // set board
    }
  };

  const dropPiece: (e: React.MouseEvent) => void = (e) => {
    if (dragging && pieceHeld) {
      pieceHeld.style.left = `auto`;
      pieceHeld.style.top = `auto`;
      pieceHeld.style.position = "static";
      pieceHeld.style.zIndex = `0`;
      setPieceHeld(null);
      setDragging(false);

      // Get the div that has board as className
      const boardDiv = boardRef.current;
      if (boardDiv) {
        // Get the top left coordinates of the board
        const boardRect = boardDiv.getBoundingClientRect();
        const boardTopLeftX = boardRect.left;
        const boardTopLeftY = boardRect.top;

        // Get the size of the board's square grid from template columns
        const squareSize =
          parseInt(
            getComputedStyle(boardDiv)
              .getPropertyValue("grid-template-columns")
              .split(" ")[0]
          ) || 0;

        // Check if the current mouse location is outside the whole board
        if (
          e.clientX < boardTopLeftX ||
          e.clientX > boardTopLeftX + squareSize * cols ||
          e.clientY < boardTopLeftY ||
          e.clientY > boardTopLeftY + squareSize * rows
        ) {
          // The current mouse location is outside the whole board
          return;
        } else {
          // Set x and y variables of the board piece location from the top left coordinates of the board
          const y = Math.floor((e.clientX - boardTopLeftX) / squareSize);
          const x = Math.floor((e.clientY - boardTopLeftY) / squareSize);

          let tempBoard: Piece[][] = [[], [], [], [], [], [], [], []];
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              tempBoard[y].push(board[y][x]);
            }
          }
          tempBoard[x][y] = tempBoard[grabLoc[0]][grabLoc[1]];
          tempBoard[grabLoc[0]][grabLoc[1]] = "#";
          setBoard(tempBoard);
        }
      }
    }
  };

  const dragOver: (e: React.DragEvent) => void = (e) => {
    console.log(e);
    e.preventDefault();
  }

  return (
    <div ref={boardRef} className="board">
      {board.map((row, x) => (
        row.map((square, y) => (
          <div key={x * rows + y} className={(x * rows + y + x) & 1 ? "dark" : "light"} onDrop={(e) => (updatePiece(e, x, y))} onDragOver={(e) => dragOver(e)}>
            {square !== "#" &&
              <div
                className="piece"
                style={{ backgroundImage: `url(${pieces[square]})` }}
                draggable
                onMouseDown={(e) => grabPiece(e, x, y)}
                onMouseUp={(e) => dropPiece(e)}
              />}
          </div>
        ))
      ))}
    </div>
  );
};

export default ChessBoard;