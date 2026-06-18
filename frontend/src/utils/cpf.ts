/**
 * Valida um CPF brasileiro.
 *
 * Faz três verificações:
 *   1. Formato (regex)
 *   2. Sequências repetidas (000.000.000-00, 111.111.111-11, etc)
 *   3. Dígitos verificadores (algoritmo módulo 11)
 */

// Aceita formatos: "000.000.000-00" ou "00000000000"
const CPF_FORMAT_REGEX = /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/;

/**
 * Remove tudo que não é dígito (pontos, traços, espaços).
 */
function digitsOnly(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Calcula um dígito verificador do CPF.
 * @param base - string com os dígitos a serem usados no cálculo (9 ou 10)
 */
function calcDigit(base: string): number {
  const length = base.length;
  let sum = 0;

  for (let i = 0; i < length; i++) {
    sum += parseInt(base[i], 10) * (length + 1 - i);
  }

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

/**
 * Verifica se um CPF é válido.
 * Aceita com ou sem máscara.
 *
 * @example
 *   isValidCpf("111.444.777-35")  // true
 *   isValidCpf("11144477735")     // true
 *   isValidCpf("111.111.111-11")  // false  (sequência repetida)
 *   isValidCpf("123.456.789-00")  // false  (dígitos verificadores errados)
 */
export function isValidCpf(cpf: string | null | undefined): boolean {
  if (!cpf || typeof cpf !== "string") return false;

  // 1. valida formato
  if (!CPF_FORMAT_REGEX.test(cpf)) return false;

  // 2. extrai só os dígitos
  const digits = digitsOnly(cpf);
  if (digits.length !== 11) return false;

  // 3. rejeita sequências repetidas (111..., 222..., etc.)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // 4. calcula e compara os dois dígitos verificadores
  const firstDigit = calcDigit(digits.substring(0, 9));
  const secondDigit = calcDigit(digits.substring(0, 10));

  return (
    firstDigit === parseInt(digits[9], 10) &&
    secondDigit === parseInt(digits[10], 10)
  );
}

/**
 * Remove a máscara e retorna apenas os 11 dígitos.
 * Útil para salvar no banco de forma padronizada.
 */
export function normalizeCpf(cpf: string): string {
  return digitsOnly(cpf);
}

/**
 * Formata 11 dígitos como "000.000.000-00".
 */
export function formatCpf(cpf: string): string {
  const digits = digitsOnly(cpf);
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
