import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, Thermometer, Activity, CheckCircle } from "lucide-react";

interface CharaGameProps {
  onComplete: (score: number, duration: number) => void;
  onClose: () => void;
}

interface Animal {
  type: 'cow' | 'goat' | 'chicken';
  name: string;
  health: number;
  hunger: number;
  happiness: number;
  age: string;
}

interface FeedType {
  name: string;
  healthBoost: number;
  hungerReduction: number;
  happinessBoost: number;
  cost: number;
}

const feedTypes: FeedType[] = [
  { name: "हरा चारा", healthBoost: 10, hungerReduction: 15, happinessBoost: 5, cost: 2 },
  { name: "दाना मिश्रण", healthBoost: 5, hungerReduction: 20, happinessBoost: 3, cost: 3 },
  { name: "पानी", healthBoost: 2, hungerReduction: 5, happinessBoost: 8, cost: 1 },
  { name: "दवाई", healthBoost: 25, hungerReduction: 0, happinessBoost: -2, cost: 5 },
  { name: "विशेष भोजन", healthBoost: 15, hungerReduction: 25, happinessBoost: 10, cost: 6 }
];

export function CharaGame({ onComplete, onClose }: CharaGameProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [currentAnimal, setCurrentAnimal] = useState(0);
  const [budget, setBudget] = useState(50);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const maxRounds = 5;

  const initializeAnimals = () => {
    const animalData: Animal[] = [
      {
        type: 'cow',
        name: 'गाय',
        health: Math.floor(Math.random() * 30) + 40,
        hunger: Math.floor(Math.random() * 40) + 30,
        happiness: Math.floor(Math.random() * 30) + 40,
        age: 'वयस्क'
      },
      {
        type: 'goat',
        name: 'बकरी',
        health: Math.floor(Math.random() * 30) + 50,
        hunger: Math.floor(Math.random() * 50) + 40,
        happiness: Math.floor(Math.random() * 30) + 35,
        age: 'युवा'
      },
      {
        type: 'chicken',
        name: 'मुर्गी',
        health: Math.floor(Math.random() * 40) + 30,
        hunger: Math.floor(Math.random() * 60) + 40,
        happiness: Math.floor(Math.random() * 40) + 30,
        age: 'युवा'
      }
    ];
    setAnimals(animalData);
  };

  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setCurrentAnimal(0);
    setScore(0);
    setRound(1);
    setBudget(50);
    setTimeLeft(60);
    setGameEnded(false);
    initializeAnimals();
  };

  const feedAnimal = (feedIndex: number) => {
    const feed = feedTypes[feedIndex];
    if (budget < feed.cost) {
      setLastFeedback("बजट कम है!");
      return;
    }

    setBudget(prev => prev - feed.cost);
    
    setAnimals(prev => prev.map((animal, index) => {
      if (index === currentAnimal) {
        const newHealth = Math.min(100, animal.health + feed.healthBoost);
        const newHunger = Math.max(0, animal.hunger - feed.hungerReduction);
        const newHappiness = Math.min(100, animal.happiness + feed.happinessBoost);
        
        // Calculate score based on improvement
        const healthImprovement = newHealth - animal.health;
        const hungerReduction = animal.hunger - newHunger;
        const happinessImprovement = newHappiness - animal.happiness;
        const totalImprovement = healthImprovement + hungerReduction + happinessImprovement;
        
        setScore(prevScore => prevScore + Math.max(0, totalImprovement));
        setLastFeedback(`अच्छा! ${feed.name} से ${totalImprovement.toFixed(0)} अंक मिले।`);
        
        return {
          ...animal,
          health: newHealth,
          hunger: newHunger,
          happiness: newHappiness
        };
      }
      return animal;
    }));

    setTimeout(() => {
      setLastFeedback(null);
      if (currentAnimal + 1 >= animals.length) {
        // All animals fed, next round
        nextRound();
      } else {
        setCurrentAnimal(prev => prev + 1);
      }
    }, 2000);
  };

  const nextRound = () => {
    if (round >= maxRounds) {
      endGame();
      return;
    }

    // Decrease animal stats for next round (simulation of time passing)
    setAnimals(prev => prev.map(animal => ({
      ...animal,
      health: Math.max(20, animal.health - Math.floor(Math.random() * 15) - 5),
      hunger: Math.min(100, animal.hunger + Math.floor(Math.random() * 20) + 10),
      happiness: Math.max(20, animal.happiness - Math.floor(Math.random() * 10) - 5)
    })));

    setRound(prev => prev + 1);
    setCurrentAnimal(0);
    setBudget(prev => prev + 20); // Add some budget for next round
    setTimeLeft(60);
  };

  const endGame = () => {
    setGameEnded(true);
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    // Bonus score for healthy animals
    const finalBonus = animals.reduce((bonus, animal) => {
      return bonus + Math.max(0, animal.health - 50) + Math.max(0, 50 - animal.hunger) + Math.max(0, animal.happiness - 50);
    }, 0);
    
    onComplete(score + finalBonus, duration);
  };

  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0 && !lastFeedback) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted && !gameEnded) {
      endGame();
    }
  }, [timeLeft, gameStarted, gameEnded, lastFeedback]);

  const getAnimalIcon = (type: string) => {
    switch (type) {
      case 'cow': return '🐄';
      case 'goat': return '🐐';
      case 'chicken': return '🐔';
      default: return '🐄';
    }
  };

  const getHealthColor = (value: number) => {
    if (value >= 70) return "text-green-500";
    if (value >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">चारा</CardTitle>
          <p className="text-muted-foreground">
            पशुधन और पोषण प्रबंधन खेल
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Badge variant="secondary">3 पशु</Badge>
            <Badge variant="secondary">{maxRounds} राउंड</Badge>
            <Badge variant="secondary">स्वास्थ्य प्रबंधन</Badge>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            पशुओं के लिए सही आहार चुनें और उनकी सेहत बनाए रखें।
          </div>
          <div className="flex gap-2">
            <Button onClick={startGame} className="flex-1" data-testid="button-start-chara-game">
              खेल शुरू करें
            </Button>
            <Button variant="outline" onClick={onClose} data-testid="button-close-chara-game">
              बंद करें
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameEnded) {
    const finalScore = score + animals.reduce((bonus, animal) => {
      return bonus + Math.max(0, animal.health - 50) + Math.max(0, 50 - animal.hunger) + Math.max(0, animal.happiness - 50);
    }, 0);

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">खेल पूरा!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary" data-testid="text-final-score">
              {finalScore} अंक
            </div>
            <div className="text-muted-foreground">
              {maxRounds} राउंड में पशुओं की देखभाल की
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {animals.map((animal, index) => (
              <div key={index} className="text-center p-2 bg-muted rounded">
                <div className="text-2xl mb-1">{getAnimalIcon(animal.type)}</div>
                <div className="text-xs space-y-1">
                  <div className={`font-medium ${getHealthColor(animal.health)}`}>
                    स्वास्थ्य: {animal.health}%
                  </div>
                </div>
              </div>
            ))}
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

  const animal = animals[currentAnimal];
  if (!animal) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge variant="outline" data-testid="text-round-number">
            राउंड {round}/{maxRounds}
          </Badge>
          <Badge variant="secondary" data-testid="text-time-left">
            {timeLeft}s
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">बजट: ₹{budget}</div>
          <div className="text-sm">स्कोर: <span data-testid="text-current-score">{score}</span></div>
        </div>
        <Progress value={((currentAnimal + 1) / animals.length) * 100} className="w-full" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">{getAnimalIcon(animal.type)}</div>
          <h3 className="font-semibold text-lg" data-testid="text-animal-name">
            {animal.name} ({animal.age})
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm">स्वास्थ्य</span>
            </div>
            <span className={`font-medium ${getHealthColor(animal.health)}`} data-testid="text-animal-health">
              {animal.health}%
            </span>
          </div>
          <Progress value={animal.health} className="h-2" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-sm">भूख</span>
            </div>
            <span className={`font-medium ${getHealthColor(100 - animal.hunger)}`} data-testid="text-animal-hunger">
              {animal.hunger}%
            </span>
          </div>
          <Progress value={animal.hunger} className="h-2" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm">खुशी</span>
            </div>
            <span className={`font-medium ${getHealthColor(animal.happiness)}`} data-testid="text-animal-happiness">
              {animal.happiness}%
            </span>
          </div>
          <Progress value={animal.happiness} className="h-2" />
        </div>

        {lastFeedback ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-md">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm" data-testid="text-feedback">{lastFeedback}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">चारा चुनें:</h4>
            {feedTypes.map((feed, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-left h-auto p-2 flex justify-between"
                onClick={() => feedAnimal(index)}
                disabled={budget < feed.cost}
                data-testid={`button-feed-${index}`}
              >
                <span className="text-sm">{feed.name}</span>
                <span className="text-xs text-muted-foreground">₹{feed.cost}</span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}