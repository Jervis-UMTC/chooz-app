import styled from 'styled-components';

export const Button = styled.button`
  background: linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-red) 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled(Button)`
  background: transparent;
  border: 2px solid var(--brand-orange);
  color: var(--brand-orange);
  
  &:hover {
    background: rgba(254, 126, 0, 0.1);
  }
`;
