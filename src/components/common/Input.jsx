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

  &:focus {
    outline: none;
    border-color: var(--brand-yellow);
  }

  &::placeholder {
    color: #64748b;
  }
`;
