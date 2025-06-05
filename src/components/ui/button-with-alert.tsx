import type { FC } from "react";
import { Button, ButtonProps } from "./button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogAction
} from "./alert-dialog";

interface ButtonWithAlertProps extends ButtonProps {
  headerText?: string;
  descriptionText?: string;
}

const ButtonWithAlert: FC<ButtonWithAlertProps> = ({
  onClick,
  headerText = "Confirm",
  descriptionText = "Are you sure you want to continue?",
  ...props
}) => {
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button {...props} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>{headerText}</AlertDialogHeader>
          <AlertDialogDescription>{descriptionText}</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClick}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ButtonWithAlert;
