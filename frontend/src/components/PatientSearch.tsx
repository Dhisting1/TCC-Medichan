import { useState } from "react";
import styled from "styled-components";
import { api } from "../services/api";
import { TEAL, LIME, WHITE, BORDER, MUTED, SUBTLE } from "../styles/tokens";

const SideCard = styled.div`
  background: ${WHITE}; border-radius: 12px;
  border: 1px solid ${BORDER}; overflow: hidden; margin-bottom: 16px;
`;

const SideHeader = styled.div`
  padding: 12px 16px; background: ${TEAL}; color: ${WHITE}; font-size: 13px; font-weight: 600;
`;

const SideBody = styled.div`padding: 16px;`;

const SearchRow = styled.div`
  display: flex; gap: 0;
  border: 1.5px solid ${BORDER}; border-radius: 8px; overflow: hidden;
  margin-bottom: 12px;
  &:focus-within { border-color: ${TEAL}; }
`;

const SearchInput = styled.input`
  flex: 1; padding: 9px 12px; border: none; outline: none;
  font-size: 13px; color: #111827; background: ${WHITE};
  &::placeholder { color: #9ca3af; }
`;

const SearchBtn = styled.button`
  padding: 9px 14px; background: ${TEAL}; color: ${WHITE};
  border: none; font-size: 13px; font-weight: 600; cursor: pointer;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Field = styled.div`margin-bottom: 8px; &:last-child { margin-bottom: 0; }`;
const FieldLabel = styled.p`font-size: 11px; color: #9ca3af; margin-bottom: 2px;`;
const FieldValue = styled.p`font-size: 13px; color: #374151; font-weight: 500; word-break: break-all;`;

const ErrorMsg = styled.p`font-size: 12px; color: #dc2626; margin-top: 4px;`;

const Hint = styled.p`font-size: 11px; color: #9ca3af; text-align: center; padding: 8px 0;`;

export interface PatientData {
  id:    string;
  email: string;
  cpf?:  string;
}

interface Props {
  onSelect: (patient: PatientData) => void;
  selected?: PatientData | null;
}

export default function PatientSearch({ onSelect, selected }: Props) {
  const [query,     setQuery]     = useState("");
  const [searching, setSearching] = useState(false);
  const [error,     setError]     = useState("");

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`);
      onSelect(res.data.patient);
      setQuery("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Paciente não encontrado.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <>
      <SideCard>
        <SideHeader>Buscar paciente</SideHeader>
        <SideBody>
          <SearchRow>
            <SearchInput
              placeholder="Email ou CPF"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <SearchBtn onClick={handleSearch} disabled={searching}>
              {searching ? "..." : "🔍"}
            </SearchBtn>
          </SearchRow>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          {!selected && !error && (
            <Hint>Digite o email ou CPF do paciente e pressione Enter</Hint>
          )}
        </SideBody>
      </SideCard>

      <SideCard>
        <SideHeader>Dados do paciente</SideHeader>
        <SideBody>
          {selected ? (
            <>
              <Field>
                <FieldLabel>Email:</FieldLabel>
                <FieldValue>{selected.email}</FieldValue>
              </Field>
              <Field>
                <FieldLabel>CPF:</FieldLabel>
                <FieldValue>{selected.cpf || "—"}</FieldValue>
              </Field>
            </>
          ) : (
            <Hint>Nenhum paciente selecionado</Hint>
          )}
        </SideBody>
      </SideCard>
    </>
  );
}
