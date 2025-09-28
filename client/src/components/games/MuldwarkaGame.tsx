import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";

interface MuldwarkaGameProps {
  onComplete: (score: number, duration: number) => void;
  onClose: () => void;
}

export function MuldwarkaGame({ onComplete, onClose }: MuldwarkaGameProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gamePhase, setGamePhase] = useState<'start' | 'showing' | 'input' | 'end'>('start');
  const [showingIndex, setShowingIndex] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isRevealing, setIsRevealing] = useState(false);

  const maxLevel = 8;
  const gridSize = 9; // 3x3 grid

  const generateSequence = useCallback((level: number) => {
    const sequenceLength = Math.min(level + 2, 10);
    const newSequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * gridSize));
    }
    setSequence(newSequence);
    setUserSequence([]);
  }, []);

  const startGame = () => {
    setGamePhase('showing');
    setStartTime(Date.now());
    setCurrentLevel(1);
    setScore(0);
    generateSequence(1);
  };

  const startLevel = useCallback(() => {
    setGamePhase('showing');
    setShowingIndex(0);
    setIsRevealing(true);
    generateSequence(currentLevel);
  }, [currentLevel, generateSequence]);

  const handleCellClick = (index: number) => {
    if (gamePhase !== 'input') return;

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    // Check if the sequence is correct so far
    if (sequence[newUserSequence.length - 1] !== index) {
      // Wrong answer - end game
      endGame();
      return;
    }

    // Check if sequence is complete
    if (newUserSequence.length === sequence.length) {
      // Correct sequence completed
      const points = currentLevel * 10;
      setScore(prev => prev + points);

      if (currentLevel >= maxLevel) {
        // Game completed
        endGame();
      } else {
        // Next level
        setTimeout(() => {
          setCurrentLevel(prev => prev + 1);
          setUserSequence([]);
          startLevel();
        }, 1000);
      }
    }
  };

  const endGame = () => {
    setGamePhase('end');
    const duration = Math.floor((Date.now() - startTime) / 1000);
    onComplete(score, duration);
  };

  useEffect(() => {
    if (gamePhase === 'showing' && isRevealing) {
      if (showingIndex < sequence.length) {
        const timer = setTimeout(() => {
          setShowingIndex(prev => prev + 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Finished showing sequence
        const timer = setTimeout(() => {
          setGamePhase('input');
          setIsRevealing(false);
          setShowingIndex(0);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [gamePhase, showingIndex, sequence.length, isRevealing]);

  useEffect(() => {
    if (gamePhase === 'showing' && sequence.length > 0) {
      startLevel();
    }
  }, [gamePhase, sequence.length, startLevel]);

  if (gamePhase === 'start') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">मुलदवारका</CardTitle>
          <p className="text-muted-foreground">
            संख्याओं और पैटर्न को याद रखें। स्मृति विकास का खेल।
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Badge variant="secondary">{maxLevel} स्तर</Badge>
            <Badge variant="secondary">स्मृति और एकाग्रता</Badge>
            <Badge variant="secondary">प्रत्येक स्तर = 10 × स्तर अंक</Badge>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            चमकते हुए नंबरों का क्रम याद रखें और फिर उसी क्रम में दबाएं।
          </div>
          <div className="flex gap-2">
            <Button onClick={startGame} className="flex-1" data-testid="button-start-muldwarka-game">
              खेल शुरू करें
            </Button>
            <Button variant="outline" onClick={onClose} data-testid="button-close-muldwarka-game">
              बंद करें
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gamePhase === 'end') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">खेल पूरा!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary" data-testid="text-final-score">
              {score} अंक
            </div>
            <div className="text-muted-foreground">
              {currentLevel - 1} स्तर पूरे किए
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={startGame} className="flex-1" data-testid="button-play-again">
              फिर से खेलें
            </Button>
            <Button variant="outline" onClick={onClose} data-testid="button-close-game">
              बंद करें
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge variant="outline" data-testid="text-current-level">
            स्तर {currentLevel}
          </Badge>
          <div className="flex gap-2">
            {gamePhase === 'showing' && <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" />देखें</Badge>}
            {gamePhase === 'input' && <Badge variant="secondary"><EyeOff className="w-3 h-3 mr-1" />दोहराएं</Badge>}
          </div>
        </div>
        <Progress value={(currentLevel / maxLevel) * 100} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">
            {gamePhase === 'showing' ? 'पैटर्न याद रखें' : 'पैटर्न दोहराएं'}
          </div>
          <div className="text-lg font-semibold" data-testid="text-sequence-length">
            {sequence.length} संख्याएं
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
          {Array.from({ length: gridSize }, (_, index) => {
            const isShowing = gamePhase === 'showing' && 
                             sequence.slice(0, showingIndex).includes(index);
            const isUserSelected = userSequence.includes(index);
            const isCurrentShowing = gamePhase === 'showing' && 
                                   showingIndex > 0 && 
                                   sequence[showingIndex - 1] === index;

            return (
              <Button
                key={index}
                variant={isCurrentShowing ? "default" : isShowing || isUserSelected ? "secondary" : "outline"}
                className={`h-16 text-xl transition-all duration-300 ${
                  isCurrentShowing ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCellClick(index)}
                disabled={gamePhase === 'showing'}
                data-testid={`button-cell-${index}`}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            स्कोर: <span className="font-semibold" data-testid="text-current-score">{score}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}