
        // ==================== ANIMATED BACKGROUND ====================
        const healthyFoods = ['🥗', '🥦', '🍎', '🥕', '🥑', '🌽', '🫐', '🥬', '🍊', '🥝', '🥒', '🧅', '🫒', '🥐', '🍞'];

        function initializeBackground() {
            const background = document.getElementById('foodBackground');
            
            // Create initial food items
            for (let i = 0; i < 10; i++) {
                const foodItem = document.createElement('div');
                foodItem.className = 'food-item';
                foodItem.textContent = healthyFoods[i % healthyFoods.length];
                background.appendChild(foodItem);
            }

            // Rotate foods every 4 seconds
            setInterval(() => {
                const foodItems = document.querySelectorAll('.food-item');
                foodItems.forEach((item, index) => {
                    const newFood = healthyFoods[Math.floor(Math.random() * healthyFoods.length)];
                    item.textContent = newFood;
                });
            }, 4000);
        }

        // ==================== DEVELOPER-ONLY STORAGE ====================
        class DeveloperStorage {
            constructor() {
                this.storageKey = 'meal_mate_secure_vault_dev_only';
                this.encryptionKey = 'MEALMATE_DEV_2026'; // For simple encoding
                this.logs = [];
            }

            // Simple encryption (base64 + key for obfuscation)
            encrypt(data) {
                return btoa(JSON.stringify(data) + this.encryptionKey);
            }

            // Simple decryption
            decrypt(encrypted) {
                try {
                    const decoded = atob(encrypted);
                    return JSON.parse(decoded.replace(this.encryptionKey, ''));
                } catch (e) {
                    return null;
                }
            }

            // Store user data securely
            storeUserData(userData) {
                let vault = this.getVault();
                const userId = userData.id || Date.now();
                
                vault[userId] = {
                    id: userId,
                    username: userData.username,
                    password: userData.password, // Stored for dev access only
                    fullName: userData.fullName,
                    email: userData.email,
                    createdAt: new Date().toISOString(),
                    loginAttempts: vault[userId]?.loginAttempts || []
                };

                localStorage.setItem(this.storageKey, this.encrypt(vault));
                this.logToConsole('USER_REGISTERED', userData.username, vault[userId]);
                return userId;
            }

            // Log login attempt
            logLoginAttempt(username, success, details = {}) {
                let vault = this.getVault();
                
                // Find user
                const userId = Object.keys(vault).find(id => vault[id].username === username);
                
                if (userId) {
                    if (!vault[userId].loginAttempts) vault[userId].loginAttempts = [];
                    
                    vault[userId].loginAttempts.push({
                        timestamp: new Date().toISOString(),
                        success,
                        ipAddress: this.getDeviceInfo().ipSimulation,
                        userAgent: navigator.userAgent.substring(0, 50)
                    });

                    localStorage.setItem(this.storageKey, this.encrypt(vault));
                }

                this.logToConsole('LOGIN_ATTEMPT', username, {
                    success,
                    timestamp: new Date().toISOString(),
                    ...details
                });
            }

            // Get all stored users (developers only)
            getAllUsers() {
                return this.getVault();
            }

            // Get vault
            getVault() {
                try {
                    const encrypted = localStorage.getItem(this.storageKey);
                    if (!encrypted) return {};
                    return this.decrypt(encrypted) || {};
                } catch (e) {
                    return {};
                }
            }

            // Get device info
            getDeviceInfo() {
                return {
                    userAgent: navigator.userAgent,
                    ipSimulation: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
                    browser: this.detectBrowser(),
                    timestamp: new Date().toISOString()
                };
            }

            detectBrowser() {
                if (navigator.userAgent.indexOf('Chrome') > -1) return 'Chrome';
                if (navigator.userAgent.indexOf('Safari') > -1) return 'Safari';
                if (navigator.userAgent.indexOf('Firefox') > -1) return 'Firefox';
                return 'Unknown';
            }

            // Console logging for developers
            logToConsole(action, username, data) {
                const timestamp = new Date().toISOString();
                const logEntry = { action, username, timestamp, data };
                this.logs.push(logEntry);

                // Styled console output
                console.log('%c========== MEAL MATE DEV STORAGE ==========', 'color: #FFB800; font-weight: bold; background: #B80000; padding: 4px 8px; border-radius: 4px; font-size: 14px;');
                console.log('%cACTION:', 'color: #FFB800; font-weight: bold;', action);
                console.log('%cUSERNAME:', 'color: #B80000; font-weight: bold;', username);
                console.log('%cTIMESTAMP:', 'color: #FFB800; font-weight: bold;', timestamp);
                console.log('%cDATA:', 'color: #B80000; font-weight: bold;', data);
                console.log('%cDEVELOPERS ONLY - DO NOT SHARE THIS INFORMATION', 'color: red; font-weight: bold; font-size: 12px;');
                console.log('=========================================', '');
            }

            // Get all logs for developers
            getLogs() {
                return this.logs;
            }

            // Clear all data (admin only)
            clearVault() {
                if (confirm('⚠️ DEVELOPER ONLY: Clear all user data? This cannot be undone!')) {
                    localStorage.removeItem(this.storageKey);
                    this.logs = [];
                    console.log('%cVault cleared!', 'color: red; font-weight: bold; font-size: 16px;');
                }
            }
        }

        // Initialize developer storage
        const devStorage = new DeveloperStorage();

        // Make available in console
        window.MealMateDev = {
            getAllUsers: () => {
                console.clear();
                console.log('%c🔐 MEALMATE DEVELOPER VAULT 🔐', 'color: white; background: #B80000; padding: 10px; font-size: 16px; font-weight: bold;');
                console.log('%c⚠️ SENSITIVE DATA - DEVELOPERS ONLY ⚠️', 'color: red; font-weight: bold; font-size: 14px;');
                console.table(devStorage.getAllUsers());
            },
            getLogs: () => {
                console.clear();
                console.log('%c📋 MEALMATE LOGIN LOGS', 'color: white; background: #FFB800; padding: 10px; font-size: 16px; font-weight: bold;');
                console.table(devStorage.getLogs());
            },
            getVault: () => devStorage.getVault(),
            clearVault: () => devStorage.clearVault(),
            getUserLogins: (username) => {
                const vault = devStorage.getAllUsers();
                const user = Object.values(vault).find(u => u.username === username);
                if (user && user.loginAttempts) {
                    console.table(user.loginAttempts);
                } else {
                    console.log('No login attempts found for', username);
                }
            }
        };

        // ==================== USER AUTHENTICATION ====================
        let isLogin = false;

        function validateForm() {
            let isValid = true;
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!isLogin) {
                // Full Name validation
                const fullNameError = document.getElementById('fullNameError');
                if (fullName.trim().length < 2) {
                    fullNameError.textContent = 'Full name is required';
                    fullNameError.style.display = 'block';
                    isValid = false;
                } else {
                    fullNameError.style.display = 'none';
                }

                // Email validation
                const emailError = document.getElementById('emailError');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    emailError.textContent = 'Please enter a valid email';
                    emailError.style.display = 'block';
                    isValid = false;
                } else {
                    emailError.style.display = 'none';
                }
            }

            // Username validation
            const usernameError = document.getElementById('usernameError');
            if (username.trim().length < 2) {
                usernameError.textContent = 'Username is required';
                usernameError.style.display = 'block';
                isValid = false;
            } else {
                usernameError.style.display = 'none';
            }

            // Password validation
            const passwordError = document.getElementById('passwordError');
            if (password.length < 6) {
                passwordError.textContent = 'Password must be at least 6 characters';
                passwordError.style.display = 'block';
                isValid = false;
            } else {
                passwordError.style.display = 'none';
            }

            return isValid;
        }

        // ==================== FORM SUBMISSION ====================
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();

            if (!validateForm()) return;

            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!isLogin) {
                // Sign Up - Store user data securely in BOTH places
                const userData = {
                    id: Date.now(),
                    fullName,
                    username,
                    password,
                    email: email // ✅ USE REAL EMAIL from form
                };

                // Store in developer vault
                devStorage.storeUserData(userData);

                // ✅ ALSO store in mealmate_current_user for the app to use
                localStorage.setItem('mealmate_current_user', JSON.stringify({
                    id: userData.id,
                    fullName: userData.fullName,
                    username: userData.username,
                    email: userData.email, // Real email!
                    createdAt: new Date().toISOString()
                }));

            } else {
                // Login attempt - Log to storage
                const vault = devStorage.getAllUsers();
                const user = Object.values(vault).find(u => u.username === username);
                const loginSuccess = user && user.password === password;

                devStorage.logLoginAttempt(username, loginSuccess, {
                    attemptedPassword: password,
                    userFound: !!user,
                    timestamp: new Date().toISOString()
                });

                if (!loginSuccess) {
                    const msg = document.getElementById('formMessage');
                    msg.textContent = '❌ Invalid credentials';
                    msg.className = 'alert alert-error';
                    return;
                }

                // ✅ Store logged-in user data
                localStorage.setItem('mealmate_current_user', JSON.stringify({
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email, // Real email!
                    loginAt: new Date().toISOString()
                }));
            }

            // Success message
            const msg = document.getElementById('formMessage');
            msg.textContent = isLogin ? '🍽️ Welcome back! Redirecting...' : '🎉 Account created! Redirecting...';
            msg.className = 'alert alert-success';

            setTimeout(() => {
                window.location.href = './MEALMEET/MEALMATE/mealmate.html'; // Redirect to home - Fixed for GitHub Pages
            }, 1500);
        });

        // ==================== TOGGLE FORM ====================
        function toggleForm() {
            isLogin = !isLogin;

            // Update form visibility
            document.getElementById('fullNameField').style.display = isLogin ? 'none' : 'block';
            document.getElementById('emailField').style.display = isLogin ? 'none' : 'block';

            // Update text
            document.getElementById('formTitle').textContent = isLogin ? 'Sign In' : 'Sign Up';
            document.getElementById('submitText').textContent = isLogin ? 'Let\'s Eat!' : 'Let\'s Start!';
            document.getElementById('toggleText').textContent = isLogin ? 'New here?' : 'Got a seat?';
            document.getElementById('toggleLink').textContent = isLogin ? 'Sign up' : 'Sign in';
            document.getElementById('brandLeft').textContent = isLogin ? 'FOOD' : 'JOIN';
            document.getElementById('headline1').textContent = isLogin ? 'MORE' : 'LET\'S';
            document.getElementById('headline2').textContent = isLogin ? 'EASIER!' : 'START!';
            document.getElementById('brandRight').textContent = isLogin ? 'BUDGETING' : 'COOKING';

            // Clear form
            document.getElementById('authForm').reset();
            document.getElementById('formMessage').classList.add('hidden');
        }

        // ==================== HIDDEN DEVELOPER PANEL ====================
        // Access with: Ctrl+Shift+D then type 'devpanel'
        let devPanelCode = '';
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.keyCode === 68) { // Ctrl+Shift+D
                e.preventDefault();
                devPanelCode = prompt('🔐 Developer Access Code:', '');
                if (devPanelCode === 'devpanel') {
                    showDevPanel();
                } else if (devPanelCode) {
                    alert('❌ Invalid access code');
                }
            }
        });

        function showDevPanel() {
            const vault = devStorage.getAllUsers();
            const users = Object.values(vault);

            if (users.length === 0) {
                alert('📭 No users registered yet');
                return;
            }

            let panelContent = '🍽️ MEALMATE DEVELOPER VAULT\n';
            panelContent += '============================\n\n';

            users.forEach((user, index) => {
                panelContent += `USER #${index + 1}\n`;
                panelContent += `─────────────\n`;
                panelContent += `ID: ${user.id}\n`;
                panelContent += `Username: ${user.username}\n`;
                panelContent += `Password: ${user.password}\n`;
                panelContent += `Full Name: ${user.fullName}\n`;
                panelContent += `Email: ${user.email}\n`;
                panelContent += `Created: ${new Date(user.createdAt).toLocaleString()}\n`;
                panelContent += `Login Attempts: ${user.loginAttempts?.length || 0}\n`;
                
                if (user.loginAttempts && user.loginAttempts.length > 0) {
                    panelContent += `Last Login: ${user.loginAttempts[user.loginAttempts.length - 1].timestamp}\n`;
                }
                panelContent += '\n';
            });

            // Create modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;

            const panel = document.createElement('div');
            panel.style.cssText = `
                background: #B80000;
                color: #FFB800;
                padding: 30px;
                border-radius: 16px;
                border: 4px solid #FFB800;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.6;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            `;

            panel.innerHTML = `
                <h2 style="color: #FFB800; text-align: center; margin-bottom: 20px;">🔐 DEVELOPER VAULT</h2>
                <pre style="color: #FFB800; background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; word-break: break-word;">${panelContent}</pre>
                <p style="color: #FFB800; font-size: 10px; text-align: center; margin-top: 20px;">⚠️ DEVELOPERS ONLY - DO NOT SHARE THIS INFORMATION ⚠️</p>
                <button onclick="this.closest('div').parentElement.remove()" style="width: 100%; padding: 12px; background: #FFB800; color: #B80000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 15px;">Close Panel</button>
            `;

            modal.appendChild(panel);
            document.body.appendChild(modal);

            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });

            // Log access
            console.log('%c⚠️ DEVELOPER PANEL ACCESSED', 'color: red; font-weight: bold; font-size: 14px;');
            console.log('Vault contents displayed to developer');
        }

        // ==================== INITIALIZATION ====================
        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('authForm').style.display = 'block';
            initializeBackground();
            
            // Log initialization
            console.log('%c✅ Secure Developer Storage Initialized', 'color: #27ae60; font-weight: bold;');
        });
 