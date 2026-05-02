import { toast } from 'sonner';

export const showSuccess = (msg: string) =>
  toast.success(msg, { duration: 3000 });

export const showError = (msg: string) =>
  toast.error(msg, { duration: 5000 });

export const showWarning = (msg: string) =>
  toast.warning(msg, { duration: 4000 });

export const showInfo = (msg: string) =>
  toast.info(msg, { duration: 3000 });

export const showLoading = (msg: string) =>
  toast.loading(msg);

export const showPromise = <T,>(
  promise: Promise<T>,
  msgs: { loading: string; success: string; error: string }
) => toast.promise(promise, msgs);
