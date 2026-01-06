'use client';
import Swal from 'sweetalert2';

const PURPLE = '#7c3aed';
const PINK = '#ec4899';
const GRAY = '#6b7280';

// Common styling configuration for all alerts
const commonConfig = {
  background: '#ffffff',
  color: '#1f2937',
  customClass: {
    popup: 'rounded-xl shadow-2xl border border-purple-100',
    title: 'text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
    htmlContainer: 'text-gray-600',
    confirmButton: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all',
    cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all',
  },
  buttonsStyling: false,
  showClass: {
    popup: 'animate__animated animate__fadeIn animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOut animate__faster'
  }
};

export async function showSuccess(title: string, text?: string) {
  return await Swal.fire({
    ...commonConfig,
    title,
    text,
    icon: 'success',
    iconColor: '#10b981',
    confirmButtonText: 'Awesome!'
  });
}

export async function showError(title: string, text?: string) {
  return await Swal.fire({
    ...commonConfig,
    title,
    text,
    icon: 'error',
    iconColor: '#ef4444',
    confirmButtonText: 'Got it'
  });
}

export async function showConfirm(title: string, text: string) {
  const result = await Swal.fire({
    ...commonConfig,
    title,
    text,
    icon: 'question',
    iconColor: PURPLE,
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel',
    focusConfirm: false,
    focusCancel: true,
  });
  return result.isConfirmed;
}

export async function showInfo(title: string, text?: string) {
  return await Swal.fire({
    ...commonConfig,
    title,
    text,
    icon: 'info',
    iconColor: '#3b82f6',
    confirmButtonText: 'OK'
  });
}

export async function showWarning(title: string, text?: string) {
  return await Swal.fire({
    ...commonConfig,
    title,
    text,
    icon: 'warning',
    iconColor: '#f59e0b',
    confirmButtonText: 'Understood'
  });
}
