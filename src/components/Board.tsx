import React, { useState, useEffect } from "react";
import Tile from "./Tile.tsx";
import { Piece } from "./Tile.tsx";
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

interface BoardProps {
}

const ChessBoard: React.FC<BoardProps> = () => {

  const rows = 8;
  const cols = 8;

  // Position datas
  const [board, setBoard] = useState<Piece[][]>([
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"]
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
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        tempBoard[y].push("#");
      }
    }
    let rowFen = position.split("/");
    rowFen.forEach((r, y) => {
      let x = 0;
      r.split("").forEach(c => {
        if (!isNaN(Number(c))) {
          x += Number(c);
        } else {
          tempBoard[y][x] = c as Piece;
          x += 1;
        }
      })
    })
    setBoard(tempBoard);
    setTurn(turn === "w");
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
      newFen = s + "/" + newFen;
    }
    newFen += " ";
    newFen += (turn) ? "w": "b";
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
    // update fen
  }, [board]);

  const pieces = {
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

  return (
    <div className="board">
      {board.map((row, y) => (
        row.map((square, x) => (
          <div key={y * rows + x} className={(y * rows + x + y) & 1 ? "dark" : "light"}>
            {square !== "#" &&
              <Tile
                src={pieces[square]}
                setFen={setFen}
              />}
          </div>
        ))
      ))}
    </div>
  );
};

export default ChessBoard;