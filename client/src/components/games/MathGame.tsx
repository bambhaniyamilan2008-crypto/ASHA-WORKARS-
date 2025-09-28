import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X, Check } from "lucide-react";

interface MathGameProps {
  onComplete: (score: number, duration: number) => void;
  onClose: () => void;
}

interface Question {
  num1: number;
  num2: number;
  operation: '+' | '-' | '×';
  answer: number;
  options: number[];
}

export function MathGame({ onComplete, onClose }: MathGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const generateQuestion = useCallback((): Question => {
    const operations: Array<'+' | '-' | '×'> = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
    }

    // Generate incorrect options
    const options = [answer];
    while (options.length < 4) {
      const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10;
      if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return { num1, num2, operation, answer, options };
  }, []);

  const generateQuestions = useCallback(() => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      newQuestions.push(generateQuestion());
    }
    setQuestions(newQuestions);
  }, [generateQuestion]);

  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    generateQuestions();
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setGameEnded(false);
  };

  const handleAnswer = (answer: number) => {
    setSelectedAnswer(answer);
    
    setTimeout(() => {
      if (answer === questions[currentQuestion]?.answer) {
        setScore(prev => prev + 10);
      }

      if (currentQuestion + 1 >= questions.length) {
        endGame();
      } else {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      }
    }, 1000);
  };

  const endGame = () => {
    setGameEnded(true);
    const duration = Math.floor((Date.now() - startTime) / 1000);
    onComplete(score, duration);
  };

  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted && !gameEnded) {
      endGame();
    }
  }, [timeLeft, gameStarted, gameEnded, score, startTime]);

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case '+': return <Plus className="w-4 h-4" />;
      case '-': return <Minus className="w-4 h-4" />;
      case '×': return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">गणित खेल (Math Game)</CardTitle>
          <p className="text-muted-foreground">
            स्वास्थ्य डेटा के लिए बुनियादी गणित कौशल का अभ्यास करें
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Badge variant="secondary">10 प्रश्न</Badge>
            <Badge variant="secondary">30 सेकंड</Badge>
            <Badge variant="secondary">प्रत्येक सही उत्तर = 10 अंक</Badge>
          </div>
          <div className="flex gap-2">
            <Button onClick={startGame} className="flex-1" data-testid="button-start-math-game">
              खेल शुरू करें
            </Button>
            <Button variant="outline" onClick={onClose} data-testid="button-close-math-game">
              बंद करें
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameEnded) {
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
              {questions.length} में से {score / 10} सही उत्तर
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

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge variant="outline" data-testid="text-question-number">
            प्रश्न {currentQuestion + 1}/{questions.length}
          </Badge>
          <Badge variant="secondary" data-testid="text-time-left">
            {timeLeft}s
          </Badge>
        </div>
        <Progress value={(currentQuestion / questions.length) * 100} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4 flex items-center justify-center gap-4" data-testid="text-math-question">
            <span>{question.num1}</span>
            {getOperationIcon(question.operation)}
            <span>{question.num2}</span>
            <span>=</span>
            <span>?</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === option ? 
                (option === question.answer ? "default" : "destructive") : "outline"
              }
              className="h-16 text-xl"
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              data-testid={`button-answer-${option}`}
            >
              {selectedAnswer === option && option === question.answer && (
                <Check className="w-4 h-4 mr-2" />
              )}
              {option}
            </Button>
          ))}
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