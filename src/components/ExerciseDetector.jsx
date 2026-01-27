import React, { useRef, useEffect, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import { Activity, AlertCircle, CheckCircle2, Repeat, Target, Eye, Maximize } from 'lucide-react';

const ExerciseDetector = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState("Esperando...");
    const [status, setStatus] = useState("down");
    const [isGoodForm, setIsGoodForm] = useState(true);
    const [currentAngle, setCurrentAngle] = useState(180);
    const [successPulse, setSuccessPulse] = useState(false);

    const calculateAngle = (a, b, c) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    const onResults = (results) => {
        if (!results.poseLandmarks) return;

        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext('2d');
        const width = canvasElement.width;
        const height = canvasElement.height;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, width, height);

        const landmarks = results.poseLandmarks;

        // --- SQUAT LOGIC (Left Leg) ---
        const hip = landmarks[24];
        const knee = landmarks[26];
        const ankle = landmarks[28];

        const angle = calculateAngle(hip, knee, ankle);
        setCurrentAngle(angle);

        const cx = knee.x * width;
        const cy = knee.y * height;

        // Logic & Feedback
        if (angle > 155) {
            if (status === "up") {
                setReps(prev => prev + 1);
                setStatus("down");
                setSuccessPulse(true);
                setTimeout(() => setSuccessPulse(false), 800);
            }
            setFeedback("¡Baja!");
            setIsGoodForm(true);
        } else if (angle < 100) {
            setStatus("up");
            setFeedback("¡Perfecto!");
            setIsGoodForm(true);
        } else if (angle < 135 && angle > 100) {
            setFeedback("Baja +");
            setIsGoodForm(false);
        }

        // HUD Drawing - Optimizado para Tablet
        canvasCtx.shadowBlur = 10;
        canvasCtx.shadowColor = isGoodForm ? '#00f2fe' : '#ff007c';
        canvasCtx.strokeStyle = isGoodForm ? '#00f2fe' : '#ff007c';
        canvasCtx.lineWidth = 6;

        canvasCtx.beginPath();
        canvasCtx.moveTo(hip.x * width, hip.y * height);
        canvasCtx.lineTo(cx, cy);
        canvasCtx.lineTo(ankle.x * width, ankle.y * height);
        canvasCtx.stroke();

        // Mini Label Angle
        canvasCtx.fillStyle = "white";
        canvasCtx.font = "bold 24px Outfit";
        canvasCtx.fillText(`${Math.round(angle)}°`, cx + 30, cy);

        canvasCtx.restore();
    };

    useEffect(() => {
        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        pose.onResults(onResults);

        if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
            const camera = new cam.Camera(webcamRef.current.video, {
                onFrame: async () => {
                    await pose.send({ image: webcamRef.current.video });
                },
                width: 640,
                height: 480,
            });
            camera.start();
        }
    }, []);

    return (
        <div className="w-full h-full flex flex-col p-4 gap-4 overflow-hidden bg-bg-dark">

            {/* Top Bar - Resumen rápido */}
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                    <Activity className="text-primary animate-pulse" size={16} />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase">System Ready</span>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[9px] text-text-muted uppercase">Ángulo</p>
                        <p className="text-sm font-bold text-white">{Math.round(currentAngle)}°</p>
                    </div>
                </div>
            </div>

            {/* Main Visualizer Area - Maximizada */}
            <div className={`relative flex-1 rounded-3xl overflow-hidden border-2 transition-all duration-300 ${successPulse ? 'success-flash border-primary' : 'border-white/10 shadow-2xl'}`}>

                {/* HUD Overlay Elements */}
                <div className="hud-corner top-left !border-[2px]"></div>
                <div className="hud-corner top-right !border-[2px]"></div>
                <div className="hud-corner bottom-left !border-[2px]"></div>
                <div className="hud-corner bottom-right !border-[2px]"></div>
                <div className="scanline"></div>

                <Webcam
                    ref={webcamRef}
                    className="w-full h-full object-cover"
                    mirrored={true}
                />
                <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />

                {/* OVERLAY: REPS - Gigante para ver de lejos */}
                <div className="absolute top-6 right-6 flex flex-col items-center">
                    <div className="glass px-6 py-2 rounded-2xl flex flex-col items-center border-primary/50 bg-black/40">
                        <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Reps</span>
                        <span className="text-6xl font-black text-white leading-none holographic-text">{reps}</span>
                    </div>
                </div>

                {/* OVERLAY: FEEDBACK - Centrado abajo */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%] max-w-sm">
                    <div className={`glass px-6 py-3 flex items-center justify-center gap-3 transition-all border-b-4 ${isGoodForm ? 'border-b-primary' : 'border-b-accent'} bg-black/60`}>
                        {isGoodForm ?
                            <CheckCircle2 className="text-primary" size={20} /> :
                            <AlertCircle className="text-accent animate-bounce" size={20} />
                        }
                        <span className="text-lg font-bold uppercase tracking-tight text-white">{feedback}</span>
                    </div>
                </div>

                {/* Label de IA */}
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                    <span className="text-[9px] font-black text-white uppercase tracking-tighter">AI Core v1.0</span>
                </div>
            </div>

            {/* Bottom Controls - Touch Friendly */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setReps(0)}
                    className="glass bg-white/5 py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <Repeat size={20} className="text-text-muted" />
                    <span className="text-sm font-bold text-white uppercase tracking-widest">Reset</span>
                </button>

                <div className="glass bg-primary/10 border-primary/20 py-4 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-[9px] text-primary font-bold uppercase tracking-widest">Calidad Técnica</span>
                    <span className="text-lg font-black text-white">{isGoodForm ? '85%' : '40%'}</span>
                </div>
            </div>

        </div>
    );
};

export default ExerciseDetector;
