import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Pill, AlertTriangle, CheckCircle, Bell } from "lucide-react";

interface DamliGameProps {
  onComplete: (score: number, duration: number) => void;
  onClose: () => void;
}

interface Patient {
  id: number;
  name: string;
  age: number;
  condition: string;
  medicines: Medicine[];
  currentHealth: number;
}

interface Medicine {
  name: string;
  dosage: string;
  frequency: number; // hours between doses
  nextDose: number; // hours from start
  importance: 'critical' | 'important' | 'moderate';
}

interface ScheduleItem {
  patientId: number;
  medicineIndex: number;
  time: number;
  completed: boolean;
}

const patients: Patient[] = [
  {
    id: 1,
    name: "सुनीता देवी",
    age: 45,
    condition: "मधुमेह",
    currentHealth: 75,
    medicines: [
      { name: "मेटफॉर्मिन", dosage: "500mg", frequency: 12, nextDose: 0, importance: 'critical' },
      { name: "विटामिन B12", dosage: "1 गोली", frequency: 24, nextDose: 8, importance: 'moderate' }
    ]
  },
  {
    id: 2,
    name: "राम प्रसाद",
    age: 60,
    condition: "उच्च रक्तचाप",
    currentHealth: 65,
    medicines: [
      { name: "एनालाप्रिल", dosage: "5mg", frequency: 24, nextDose: 0, importance: 'critical' },
      { name: "कैल्शियम", dosage: "500mg", frequency: 12, nextDose: 6, importance: 'moderate' }
    ]
  },
  {
    id: 3,
    name: "गीता बेन",
    age: 35,
    condition: "TB उपचार",
    currentHealth: 55,
    medicines: [
      { name: "रिफैंपिसिन", dosage: "450mg", frequency: 24, nextDose: 0, importance: 'critical' },
      { name: "आइसोनियाजिड", dosage: "300mg", frequency: 24, nextDose: 0, importance: 'critical' },
      { name: "मल्टीविटामिन", dosage: "1 गोली", frequency: 24, nextDose: 12, importance: 'moderate' }
    ]
  },
  {
    id: 4,
    name: "मोहन जी",
    age: 70,
    condition: "हृदय रोग",
    currentHealth: 50,
    medicines: [
      { name: "एस्पिरिन", dosage: "75mg", frequency: 24, nextDose: 0, importance: 'important' },
      { name: "एटोरवास्टेटिन", dosage: "20mg", frequency: 24, nextDose: 18, importance: 'important' }
    ]
  }
];

export function DamliGame({ onComplete, onClose }: DamliGameProps) {
  const [gamePatients, setGamePatients] = useState<Patient[]>([]);
  const [currentTime, setCurrentTime] = useState(0); // Hours from start
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [gameSpeed, setGameSpeed] = useState(1000); // ms per hour

  const gameHours = 48; // 2 days simulation

  const generateSchedule = () => {
    const scheduleItems: ScheduleItem[] = [];
    gamePatients.forEach(patient => {
      patient.medicines.forEach((medicine, medicineIndex) => {
        for (let hour = medicine.nextDose; hour < gameHours; hour += medicine.frequency) {
          scheduleItems.push({
            patientId: patient.id,
            medicineIndex,
            time: hour,
            completed: false
          });
        }
      });
    });
    setSchedule(scheduleItems.sort((a, b) => a.time - b.time));
  };

  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setGamePatients([...patients]);
    setCurrentTime(0);
    setScore(0);
    setGameEnded(false);
    setSelectedPatient(null);
    setAlerts([]);
    generateSchedule();
  };

  const giveMedicine = (patientId: number, medicineIndex: number) => {
    const scheduleItem = schedule.find(
      item => item.patientId === patientId && 
               item.medicineIndex === medicineIndex && 
               item.time === currentTime && 
               !item.completed
    );

    if (!scheduleItem) {
      // Wrong time or medicine
      setScore(prev => Math.max(0, prev - 5));
      setAlerts(prev => [...prev, "गलत समय या दवा! -5 अंक"]);
      return;
    }

    // Update schedule
    setSchedule(prev => prev.map(item => 
      item === scheduleItem ? { ...item, completed: true } : item
    ));

    // Update patient health and score
    const patient = gamePatients.find(p => p.id === patientId);
    const medicine = patient?.medicines[medicineIndex];
    
    if (medicine) {
      let points = 0;
      switch (medicine.importance) {
        case 'critical': points = 15; break;
        case 'important': points = 10; break;
        case 'moderate': points = 5; break;
      }
      
      setScore(prev => prev + points);
      setGamePatients(prev => prev.map(p => 
        p.id === patientId ? { 
          ...p, 
          currentHealth: Math.min(100, p.currentHealth + points / 2) 
        } : p
      ));
      
      setAlerts(prev => [...prev, `सही! ${medicine.name} दी गई। +${points} अंक`]);
    }

    setSelectedPatient(null);
  };

  const checkMissedMedicines = () => {
    const missedCritical = schedule.filter(
      item => item.time < currentTime && 
               !item.completed && 
               gamePatients.find(p => p.id === item.patientId)?.medicines[item.medicineIndex].importance === 'critical'
    );

    missedCritical.forEach(item => {
      const patient = gamePatients.find(p => p.id === item.patientId);
      const medicine = patient?.medicines[item.medicineIndex];
      
      if (patient && medicine) {
        setScore(prev => Math.max(0, prev - 10));
        setGamePatients(prev => prev.map(p => 
          p.id === patient.id ? { 
            ...p, 
            currentHealth: Math.max(10, p.currentHealth - 10) 
          } : p
        ));
        setAlerts(prev => [...prev, `${patient.name} की ${medicine.name} छूट गई! -10 अंक`]);
      }
    });
  };

  const endGame = () => {
    setGameEnded(true);
    checkMissedMedicines();
    
    // Final score calculation
    const completedCritical = schedule.filter(item => 
      item.completed && 
      gamePatients.find(p => p.id === item.patientId)?.medicines[item.medicineIndex].importance === 'critical'
    ).length;
    
    const totalCritical = schedule.filter(item => 
      gamePatients.find(p => p.id === item.patientId)?.medicines[item.medicineIndex].importance === 'critical'
    ).length;
    
    const bonusScore = Math.floor((completedCritical / totalCritical) * 50);
    setScore(prev => prev + bonusScore);
    
    const duration = Math.floor((Date.now() - startTime) / 1000);
    onComplete(score + bonusScore, duration);
  };

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      const timer = setTimeout(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= gameHours) {
            endGame();
            return prev;
          }
          
          // Check for missed medicines every few hours
          if (newTime % 4 === 0) {
            checkMissedMedicines();
          }
          
          return newTime;
        });
      }, gameSpeed);
      return () => clearTimeout(timer);
    }
  }, [currentTime, gameStarted, gameEnded, gameSpeed]);

  useEffect(() => {
    // Clear old alerts
    if (alerts.length > 0) {
      const timer = setTimeout(() => {
        setAlerts(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  const getCurrentDueMedicines = () => {
    return schedule.filter(item => 
      item.time === currentTime && !item.completed
    );
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-500';
      case 'important': return 'text-orange-500';
      case 'moderate': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical': return 'destructive';
      case 'important': return 'secondary';
      case 'moderate': return 'outline';
      default: return 'outline';
    }
  };

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">डमली</CardTitle>
          <p className="text-muted-foreground">
            दवा प्रबंधन और समय सारणी
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Badge variant="secondary">4 मरीज़</Badge>
            <Badge variant="secondary">48 घंटे</Badge>
            <Badge variant="secondary">दवा अनुसूची</Badge>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            मरीजों के लिए सही समय पर सही दवा दें। महत्वपूर्ण दवाएं न भूलें!
          </div>
          <div className="flex gap-2">
            <Button onClick={startGame} className="flex-1" data-testid="button-start-damli-game">
              खेल शुरू करें
            </Button>
            <Button variant="outline" onClick={onClose} data-testid="button-close-damli-game">
              बंद करें
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameEnded) {
    const avgHealth = gamePatients.reduce((sum, p) => sum + p.currentHealth, 0) / gamePatients.length;
    
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
              औसत स्वास्थ्य: {avgHealth.toFixed(0)}%
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {gamePatients.map(patient => (
              <div key={patient.id} className="text-center p-2 bg-muted rounded">
                <div className="text-sm font-medium">{patient.name}</div>
                <div className={`text-xs ${patient.currentHealth >= 70 ? 'text-green-500' : patient.currentHealth >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {patient.currentHealth.toFixed(0)}% स्वास्थ्य
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

  const dueMedicines = getCurrentDueMedicines();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge variant="outline" data-testid="text-current-time">
            {Math.floor(currentTime / 24)} दिन {currentTime % 24} घंटे
          </Badge>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <Badge variant="secondary">{Math.floor((gameHours - currentTime) / 24)}d {(gameHours - currentTime) % 24}h बचे</Badge>
          </div>
        </div>
        <Progress value={(currentTime / gameHours) * 100} className="w-full" />
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            स्कोर: <span className="font-semibold" data-testid="text-current-score">{score}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {alerts.length > 0 && (
          <div className="space-y-1">
            {alerts.slice(-2).map((alert, index) => (
              <div key={index} className="flex items-center gap-2 text-xs p-2 bg-muted rounded">
                <Bell className="w-3 h-3" />
                <span data-testid="text-alert">{alert}</span>
              </div>
            ))}
          </div>
        )}

        {dueMedicines.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">दवा का समय!</span>
            </div>
            {dueMedicines.map((item, index) => {
              const patient = gamePatients.find(p => p.id === item.patientId);
              const medicine = patient?.medicines[item.medicineIndex];
              
              if (!patient || !medicine) return null;
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left h-auto p-3"
                  onClick={() => giveMedicine(patient.id, item.medicineIndex)}
                  data-testid={`button-give-medicine-${patient.id}-${item.medicineIndex}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="space-y-1">
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {medicine.name} - {medicine.dosage}
                      </div>
                    </div>
                    <Badge variant={getImportanceBadge(medicine.importance)}>
                      {medicine.importance === 'critical' ? 'जरूरी' : 
                       medicine.importance === 'important' ? 'महत्वपूर्ण' : 'सामान्य'}
                    </Badge>
                  </div>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-sm text-muted-foreground">
              इस समय कोई दवा नहीं देनी है
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            मरीजों की स्थिति
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {gamePatients.map(patient => (
              <div key={patient.id} className="p-2 bg-muted rounded text-center">
                <div className="text-xs font-medium">{patient.name}</div>
                <div className={`text-xs ${patient.currentHealth >= 70 ? 'text-green-500' : patient.currentHealth >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {patient.currentHealth.toFixed(0)}% स्वास्थ्य
                </div>
                <div className="text-xs text-muted-foreground">{patient.condition}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}