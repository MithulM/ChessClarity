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
  const [newLoc, setNewLoc] = useState<[number, number]>([-1, -1]);

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

  const dropPiece: (e: React.MouseEvent) => void = (e) => {
    if (dragging && pieceHeld) {
      // set board
      let tempBoard: Piece[][] = [[], [], [], [], [], [], [], []];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          tempBoard[y].push(board[y][x]);
        }
      }
      if (newLoc[0] !== -1 && newLoc[1] !== -1) {
        tempBoard[newLoc[0]][newLoc[1]] = tempBoard[grabLoc[1]][grabLoc[0]];
        tempBoard[grabLoc[0]][grabLoc[1]] = "#";
      }
      pieceHeld.style.left = `auto`;
      pieceHeld.style.top = `auto`;
      pieceHeld.style.position = "static";
      pieceHeld.style.zIndex = `0`;
      setBoard(tempBoard);
      setPieceHeld(null);
      setDragging(false);
      setNewLoc([-1, -1]);
    }
  };

  const grabPieceEnter: (e: React.MouseEvent, coordX: number, coordY: number) => void = (e, coordX, coordY) => {
    e.preventDefault();
    if (dragging) {
      console.log("Entered: ", coordX, coordY);
      setNewLoc([coordX, coordY]);
    }
  }

  const grabPieceExit: (e: React.MouseEvent, coordX: number, coordY: number) => void = (e, coordX, coordY) => {
    if (dragging) {
      console.log("Exit: ", coordX, coordY);
      setNewLoc([-1, -1]);
    }
  }

  return (
    <div className="board">
      {board.map((row, x) => (
        row.map((square, y) => (
          <div key={x * rows + y} className={(x * rows + y + x) & 1 ? "dark" : "light"} onDragOver={(e) => (grabPieceEnter(e, x, y))} onDragLeave={(e) => (grabPieceExit(e, x, y))}>
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