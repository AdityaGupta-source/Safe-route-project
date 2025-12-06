document.addEventListener('DOMContentLoaded', () => {

    const backdrop = document.getElementById('profile-backdrop');

    // --- GENERIC MODAL FUNCTIONS ---
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            backdrop.classList.add('active');
            gsap.fromTo(modal,
                { opacity: 0, y: '-60%', scale: 0.9 },
                { opacity: 1, y: '-50%', scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
            );
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            gsap.to(modal, {
                opacity: 0,
                y: '-60%',
                scale: 0.9,
                duration: 0.2,
                onComplete: () => {
                    modal.classList.add('hidden');
                    gsap.set(modal, { clearProps: "all" });
                }
            });
        }
    }

    function closeAllModals() {
        closeModal('edit-profile-modal');
        closeModal('history-modal');
        backdrop.classList.remove('active');
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeAllModals);
    }

    // --- EDIT PROFILE LOGIC ---
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    // DOM Elements to Update
    const userNameDisplay = document.querySelector('h2');
    const navUserNameDisplay = document.querySelector('.nav-actions span');
    const userEmailDisplay = document.querySelector('p[style*="text-muted"]');

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            openModal('edit-profile-modal');
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeAllModals);
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const newName = document.getElementById('edit-name').value;
            const newEmail = document.getElementById('edit-email').value;

            if (newName) {
                if (userNameDisplay) userNameDisplay.innerText = newName;
                if (navUserNameDisplay) navUserNameDisplay.innerText = `Hello, ${newName.split(' ')[0]}`;
            }
            if (newEmail && userEmailDisplay) {
                userEmailDisplay.innerText = newEmail;
            }

            closeAllModals();
            alert('Profile Updated Successfully!');
        });
    }

    // --- CHANGE PASSWORD LOGIC ---
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            // Mock Password Change
            const newPass = prompt("Enter new password (mock):");
            if (newPass) {
                alert("Password changed successfully!");
            }
        });
    }

    // --- HISTORY LOGIC ---
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const historyList = document.getElementById('history-list');

    const mockHistory = [
        { dest: "Library to Home", time: "Today, 8:30 PM", dist: "2.5 km", safe: true },
        { dest: "Metro Stn to Office", time: "Yesterday, 9:00 AM", dist: "1.2 km", safe: true },
        { dest: "Gym to Cafe", time: "Oct 24, 6:15 PM", dist: "0.8 km", safe: true },
        { dest: "Create Park to Home", time: "Oct 22, 7:45 PM", dist: "3.1 km", safe: false }, // Unsafe example
        { dest: "University to Mall", time: "Oct 20, 1:00 PM", dist: "5.5 km", safe: true },
        { dest: "Friend's House", time: "Oct 18, 11:30 PM", dist: "4.2 km", safe: true },
    ];

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        mockHistory.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem; margin-bottom: 10px;";

            const iconColor = item.safe ? 'var(--primary)' : 'var(--warning)';
            const statusColor = item.safe ? '#10b981' : '#f59e0b';
            const statusIcon = item.safe ? 'fa-check' : 'fa-triangle-exclamation';
            const statusText = item.safe ? 'Safe' : 'Hazards Detected';

            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; background: rgba(79, 70, 229, 0.1); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: ${iconColor};">
                        <i class="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                        <div style="font-weight: bold; margin-bottom: 0.2rem;">${item.dest}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${item.time} • ${item.dist}</div>
                    </div>
                </div>
                <div style="color: ${statusColor}; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid ${statusIcon}"></i> <span style="display: ${window.innerWidth < 500 ? 'none' : 'inline'}">${statusText}</span>
                </div>
            `;
            historyList.appendChild(div);
        });
    }

    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
            renderHistory();
            openModal('history-modal');
        });
    }

    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', closeAllModals);
    }

});
