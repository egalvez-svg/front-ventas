import { NotificationProvider } from "@refinedev/core";
import { toast } from "sonner";

export const notificationProvider: NotificationProvider = {
  open: ({ type, message, description, key }) => {
    const options = {
      id: key,
      description,
    };

    if (type === "success") {
      toast.success(message, options);
    } else if (type === "error") {
      toast.error(message, options);
    } else if (type === "progress") {
      toast.loading(message, options);
    } else {
      toast(message, options);
    }
  },
  close: (key) => {
    toast.dismiss(key);
  },
};
