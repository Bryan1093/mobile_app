/**
 * Validación de cédula de identidad ecuatoriana mediante algoritmo Módulo 10.
 * Requisito estricto de integridad para el registro de pacientes.
 */
export function validarCedulaEcuatoriana(cedula: string): { valida: boolean; mensaje?: string } {
  const ced = cedula.trim();

  if (!/^\d{10}$/.test(ced)) {
    return { valida: false, mensaje: 'La cédula debe contener exactamente 10 dígitos numéricos.' };
  }

  const provincia = parseInt(ced.substring(0, 2), 10);
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return { valida: false, mensaje: 'El código de provincia de la cédula no es válido.' };
  }

  const tercerDigito = parseInt(ced.charAt(2), 10);
  if (tercerDigito >= 6) {
    return { valida: false, mensaje: 'El tercer dígito de la cédula de persona natural no es válido.' };
  }

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(ced.charAt(i), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const digitoVerificador = (10 - (suma % 10)) % 10;
  const ultimoDigito = parseInt(ced.charAt(9), 10);

  if (digitoVerificador !== ultimoDigito) {
    return { valida: false, mensaje: 'El número de cédula ingresado es incorrecto.' };
  }

  return { valida: true };
}

export function validarCorreo(correo: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(correo.trim());
}

export function validarTelefonoEcuador(telefono: string): boolean {
  // Celular en Ecuador: 10 dígitos empezando con 09
  return /^09\d{8}$/.test(telefono.trim());
}

