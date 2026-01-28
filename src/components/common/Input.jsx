import styled from 'styled-components';

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #334155;
  background-color: #1e293b;
  color: white;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    outline: none;
    border-color: var(--brand-yellow);
  }

  &::placeholder {
    color: #64748b;
  }
  
  @media (max-width: 500px) {
    font-size: 16px; /* Prevents iOS zoom on focus */
  }
`;
