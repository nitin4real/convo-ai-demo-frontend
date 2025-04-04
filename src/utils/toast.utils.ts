import { toast } from "sonner";

export const handleUserErrors = (err: any) => {
    if (err?.response?.data?.userMessages) {
      const errorMessages = err?.response?.data?.userMessages
      errorMessages.forEach((message: string) => {
        toast.error(message);
      });
    }
  }