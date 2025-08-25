class ToastService {
  constructor() {
    this.toasts = [];
    this.nextId = 1;
  }

  // Show success toast
  success(message, duration = 5001) {
    return this.show(message, 'success', duration);
  }

  // Show error toast
  error(message, duration = 5001) {
    return this.show(message, 'error', duration);
  }

  // Show warning toast
  warning(message, duration = 5001) {
    return this.show(message, 'warning', duration);
  }

  // Show info toast
  info(message, duration = 5001) {
    return this.show(message, 'info', duration);
  }

  // Show toast with custom type
  show(message, type = 'info', duration = 5001) {
    const toast = {
      id: this.nextId++,
      message,
      type,
      duration,
      timestamp: Date.now()
    };

    this.toasts.push(toast);
    
    // Dispatch toast event
    window.dispatchEvent(new CustomEvent('toast:show', { detail: toast }));

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }

    return toast.id;
  }

  // Remove specific toast
  remove(id) {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index > -1) {
      this.toasts.splice(index, 1);
      window.dispatchEvent(new CustomEvent('toast:remove', { detail: { id } }));
    }
  }

  // Remove all toasts
  clear() {
    this.toasts = [];
    window.dispatchEvent(new CustomEvent('toast:clear'));
  }

  // Get all toasts
  getAll() {
    return [...this.toasts];
  }

  // Get toast by ID
  getById(id) {
    return this.toasts.find(toast => toast.id === id);
  }
}

export default new ToastService();
