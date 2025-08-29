// DOM Elements
const emailForm = document.querySelector('.email-signin');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const signinBtn = document.querySelector('.signin-btn');
const toast = document.getElementById('toast');
const toastMessage = document.querySelector('.toast-message');
const signupLink = document.getElementById('signupLink');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations
    initAnimations();
    
    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    
    // Email form submission
    emailForm.addEventListener('submit', handleEmailSignIn);
    
    // Sign up link
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Sign up feature coming soon!');
    });
    
    // Forgot password
    document.querySelector('.forgot-password').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Password reset feature coming soon!');
    });
}

// Toggle Password Visibility
function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Update eye icon
    const eyeIcon = togglePasswordBtn.querySelector('i');
    eyeIcon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

// Handle Email Sign In
async function handleEmailSignIn(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Basic validation
    if (!email || !password) {
        showToast('Please fill in all fields');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, always succeed
        showToast('Successfully signed in! Redirecting...');
        
        // Redirect to main app after a delay
        setTimeout(() => {
            window.location.href = 'μSEEK.html';
        }, 1500);
        
    } catch (error) {
        console.error('Sign in error:', error);
        showToast('Sign in failed. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

// Handle Google Sign In
function handleGoogleSignIn(response) {
    // This function will be called by Google Sign-In
    console.log('Google Sign-In response:', response);
    
    // Show loading state
    setLoadingState(true);
    
    // Process the Google Sign-In response
    processGoogleResponse(response.credential)
        .then(() => {
            showToast('Successfully signed in with Google! Redirecting...');
            
            // Redirect to main app after a delay
            setTimeout(() => {
                window.location.href = 'μSEEK.html';
            }, 1500);
        })
        .catch(error => {
            console.error('Google Sign-In error:', error);
            showToast('Google Sign-In failed. Please try again.');
            setLoadingState(false);
        });
}

// Process Google Response (simulated)
async function processGoogleResponse(credential) {
    // In a real app, you would verify the credential on your server
    // For this demo, we'll just simulate processing
    return new Promise(resolve => setTimeout(resolve, 1500));
}

// Set Loading State
function setLoadingState(loading) {
    if (loading) {
        signinBtn.classList.add('loading');
        signinBtn.disabled = true;
    } else {
        signinBtn.classList.remove('loading');
        signinBtn.disabled = false;
    }
}

// Show Toast Notification
function showToast(message, duration = 3000) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    // Hide after duration
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Initialize Animations
function initAnimations() {
    // Add animation delay to form elements
    const formElements = document.querySelectorAll('.form-group, .form-options, .signin-btn, .signup-link');
    formElements.forEach((element, index) => {
        element.style.animationDelay = `${0.2 + (index * 0.1)}s`;
        element.style.animationFillMode = 'both';
    });
}

// Utility function to decode JWT (for Google Sign-In)
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}