import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Droplets, Heart, AlertTriangle, CheckCircle } from "lucide-react";

interface PanadarGameProps {
  onComplete: (score: number, duration: number) => void;
  onClose: () => void;
}

interface Scenario {
  id: number;
  title: string;
  description: string;
  options: Array<{
    text: string;
    points: number;
    feedback: string;
  }>;
  resources: {
    water: number;
    soap: number;
    medicine: number;
  };
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "पानी की कमी",
    description: "घर में पानी की आपूर्ति कम है। परिवार के 5 सदस्यों के लिए पानी का उपयोग कैसे करें?",
    options: [
      { text: "सभी कामों के लिए समान रूप से बांटें", points: 5, feedback: "अच्छा! संतुलित वितरण महत्वपूर्ण है।" },
      { text: "पहले पीने का पानी सुरक्षित करें", points: 10, feedback: "बहुत बढ़िया! पीने का पानी सबसे जरूरी है।" },
      { text: "बाहर से पानी खरीदें", points: 3, feedback: "ठीक है, लेकिन घरेलू संसाधन बेहतर हैं।" }
    ],
    resources: { water: 3, soap: 5, medicine: 5 }
  },
  {
    id: 2,
    title: "स्वच्छता की समस्या",
    description: "बच्चों में दस्त की शिकायत है। तुरंत क्या करना चाहिए?",
    options: [
      { text: "ORS का घोल बनाकर दें", points: 10, feedback: "सही! ORS निर्जलीकरण से बचाता है।" },
      { text: "पानी पीने को कहें", points: 5, feedback: "अच्छा, लेकिन ORS बेहतर है।" },
      { text: "डॉक्टर के आने का इंतजार करें", points: 2, feedback: "देर हो सकती है। तुरंत उपचार जरूरी है।" }
    ],
    resources: { water: 4, soap: 3, medicine: 8 }
  },
  {
    id: 3,
    title: "हाथ धोने की आदत",
    description: "परिवार के सदस्य खाना खाने से पहले हाथ नहीं धोते। क्या करें?",
    options: [
      { text: "सबको समझाएं और साबुन रखें", points: 10, feedback: "उत्कृष्ट! शिक्षा और सुविधा दोनों जरूरी हैं।" },
      { text: "केवल बच्चों को कहें", points: 5, feedback: "अच्छा शुरुआत, लेकिन सभी को करना चाहिए।" },
      { text: "जब याद आए तो कहें", points: 2, feedback: "नियमित आदत बनाना बेहतर है।" }
    ],
    resources: { water: 6, soap: 9, medicine: 2 }
  }
];

export function PanadarGame({ onComplete, onClose }: PanadarGameProps) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [resources, setResources] = useState({ water: 10, soap: 10, medicine: 10 });

  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setCurrentScenario(0);
    setScore(0);
    setTimeLeft(45);
    setGameEnded(false);
    setResources({ water: 10, soap: 10, medicine: 10 });
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOption !== null) return;

    setSelectedOption(optionIndex);
    setShowFeedback(true);

    const option = scenarios[currentScenario].options[optionIndex];
    const scenario = scenarios[currentScenario];
    
    setScore(prev => prev + option.points);
    
    // Update resources based on scenario
    setResources(prev => ({
      water: Math.max(0, prev.water - scenario.resources.water + 2),
      soap: Math.max(0, prev.soap - scenario.resources.soap + 2),
      medicine: Math.max(0, prev.medicine - scenario.resources.medicine + 2)
    }));

    setTimeout(() => {
      if (currentScenario + 1 >= scenarios.length) {
        endGame();
      } else {
        setCurrentScenario(prev => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
        setTimeLeft(45);
      }
    }, 3000);
  };

  const endGame = () => {
    setGameEnded(true);
    const duration = Math.floor((Date.now() - startTime) / 1000);
    onComplete(score, duration);
  };

  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0 && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted && !gameEnded) {
      endGame();
    }
  }, [timeLeft, gameStarted, gameEnded, showFeedback]);

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">पनादार</CardTitle>
          <p className="text-muted-foreground">
            पानी और संसाधन प्रबंधन खेल
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Badge variant="secondary">{scenarios.length} परिस्थितियां</Badge>
            <Badge variant="secondary">45 सेकंड प्रत्येक</Badge>
            <Badge variant="secondary">संसाधन प्रबंधन</Badge>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            सही निर्णय लेकर पानी और स्वच्छता की समस्याओं का समाधान करें।
          </div>
          <div className="flex gap-2">
            <Button onClick={startGame} className="flex-1" data-testid="button-start-panadar-game">
              खेल शुरू करें
            </Button>
            <Button variant="outline" onClick={onClose} data-testid="button-close-panadar-game">
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
              {scenarios.length} परिस्थितियां संभाली
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
            <div className="text-center">
              <Droplets className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <div className="text-sm">{resources.water}</div>
            </div>
            <div className="text-center">
              <Heart className="w-6 h-6 mx-auto mb-1 text-pink-500" />
              <div className="text-sm">{resources.soap}</div>
            </div>
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-orange-500" />
              <div className="text-sm">{resources.medicine}</div>
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

  const scenario = scenarios[currentScenario];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" data-testid="text-scenario-number">
            परिस्थिति {currentScenario + 1}/{scenarios.length}
          </Badge>
          <Badge variant="secondary" data-testid="text-time-left">
            {timeLeft}s
          </Badge>
        </div>
        <Progress value={((currentScenario + 1) / scenarios.length) * 100} className="w-full" />
        
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="flex items-center gap-1 text-sm">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span data-testid="text-water-resource">{resources.water}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Heart className="w-4 h-4 text-pink-500" />
            <span data-testid="text-soap-resource">{resources.soap}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span data-testid="text-medicine-resource">{resources.medicine}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg" data-testid="text-scenario-title">
            {scenario.title}
          </h3>
          <p className="text-muted-foreground text-sm" data-testid="text-scenario-description">
            {scenario.description}
          </p>
        </div>

        {showFeedback && selectedOption !== null ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">+{scenario.options[selectedOption].points} अंक</span>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md text-sm" data-testid="text-feedback">
              {scenario.options[selectedOption].feedback}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {scenario.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-left h-auto p-3 whitespace-normal"
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null}
                data-testid={`button-option-${index}`}
              >
                {option.text}
              </Button>
            ))}
          </div>
        )}

        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            स्कोर: <span className="font-semibold" data-testid="text-current-score">{score}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}