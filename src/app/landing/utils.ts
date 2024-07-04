export const initializeForms = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('auth-form') as HTMLFormElement | null;

    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Login form submitted!');
        // Add further form handling logic here
      });
    }
  });
};