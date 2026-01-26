import React, { useState } from 'react';
import styled from 'styled-components';
import WheelCanvas from './WheelCanvas';
import Controls from './Controls';
import Confetti from 'react-confetti';

const GameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  padding: 40px;
  flex-wrap: wrap;
`;

const WinnerModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #0f172a;
  padding: 40px;
  border-radius: 20px;
  border: 2px solid #FEDD28;
  text-align: center;
  z-index: 100;
  box-shadow: 0 0 50px rgba(254, 221, 40, 0.3);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  z-index: 99;
`;

const WheelGame = () => {
  const [names, setNames] = useState(['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank']);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);

  const handleSpinClick = () => {
    if (!mustSpin && names.length > 1) {
      const newPrizeNumber = Math.floor(Math.random() * names.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setWinner(null);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setWinner(names[prizeNumber]);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {winner && <Confetti />}

      <GameContainer>
        <WheelCanvas
          names={names}
          mustSpin={mustSpin}
          prizeNumber={prizeNumber}
          onStopSpinning={handleStopSpinning}
        />
        <Controls
          names={names}
          setNames={setNames}
          onSpin={handleSpinClick}
          isSpinning={mustSpin}
        />
      </GameContainer>

      {winner && (
        <>
          <Overlay onClick={() => setWinner(null)} />
          <WinnerModal>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#FEDD28' }}>Winner!</h2>
            <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: '20px 0', color: '#fff' }}>{winner}</p>
            <button
              onClick={() => setWinner(null)}
              style={{
                background: 'transparent',
                border: '1px solid #fff',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Close
            </button>
          </WinnerModal>
        </>
      )}
    </div>
  );
};

export default WheelGame;
