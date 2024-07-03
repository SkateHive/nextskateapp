export const initializeForms = () => {
    document.addEventListener('DOMContentLoaded', () => {
      const loginForm = document.getElementById('login-form');
      const signupForm = document.getElementById('signup-form');
  
      if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
          event.preventDefault();
          alert('Login form submitted!');
        });
      }
  
      if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
          event.preventDefault();
          alert('Signup form submitted!');
        });
      }
    });
  }