import { useEffect, useRef, useState } from "react";

import { gameConfig } from "../game/config/gameConfig";
import { BulletHellGameEngine } from "../game/engine/GameEngine";
import { GameLoop } from "../game/engine/GameLoop";
import type { GameSnapshot } from "../game/entities/types";
import { InputManager } from "../game/input/InputManager";
import { HudOverlay } from "../ui/components/HudOverlay";
import { GameOverScreen } from "../ui/screens/GameOverScreen";
import { TitleScreen } from "../ui/screens/TitleScreen";

const emptySnapshot: GameSnapshot = {
  screenState: "TITLE",
  countdownSec: 3,
  score: 0,
  bestScore: 0,
  hp: 100,
  maxHp: 100,
  ultimateGauge: 100,
  ultimateReady: true,
  elapsedSec: 0,
  isPaused: false
};

export const App = (): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BulletHellGameEngine | null>(null);
  const loopRef = useRef<GameLoop | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);

  const [snapshot, setSnapshot] = useState<GameSnapshot>(emptySnapshot);

  useEffect(() => {
    const engine = new BulletHellGameEngine(gameConfig);
    engineRef.current = engine;
    setSnapshot(engine.getSnapshot());

    const input = new InputManager(gameConfig.controls);
    inputManagerRef.current = input;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return () => {
        input.dispose();
      };
    }

    const loop = new GameLoop(
      (dtMs) => {
        engine.handleInput(input.sample());
        engine.update(dtMs);
      },
      () => {
        engine.render(ctx);
        setSnapshot(engine.getSnapshot());
      }
    );

    loopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      input.dispose();
    };
  }, []);

  const handleStart = (): void => {
    engineRef.current?.startRun();
    setSnapshot(engineRef.current?.getSnapshot() ?? emptySnapshot);
  };

  const handleRestart = (): void => {
    engineRef.current?.startRun();
    setSnapshot(engineRef.current?.getSnapshot() ?? emptySnapshot);
  };

  const handleBackToTitle = (): void => {
    engineRef.current?.reset();
    setSnapshot(engineRef.current?.getSnapshot() ?? emptySnapshot);
  };

  return (
    <main className="app-shell">
      <section className="world-shell">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          width={gameConfig.world.width}
          height={gameConfig.world.height}
        />

        {(snapshot.screenState === "COUNTDOWN" || snapshot.screenState === "PLAYING" || snapshot.isPaused) && (
          <HudOverlay snapshot={snapshot} />
        )}

        {snapshot.screenState === "TITLE" && (
          <div className="overlay-wrap">
            <TitleScreen bestScore={snapshot.bestScore} onStart={handleStart} />
          </div>
        )}

        {snapshot.screenState === "GAME_OVER" && (
          <div className="overlay-wrap">
            <GameOverScreen
              score={snapshot.score}
              bestScore={snapshot.bestScore}
              onRestart={handleRestart}
              onBackToTitle={handleBackToTitle}
            />
          </div>
        )}
      </section>
    </main>
  );
};
