import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export const App = () => {
  return (
    <div>
      <h1>Welcome to Studly!</h1>
      <p>Gamified studying to promote academic success</p>
      <Button
        color="red"
        onClick={() => {
          notifications.show({
            title: "Hello world",
            message: "This is a notification",
          });
        }}
      >
        Hello world
      </Button>
    </div>
  );
}
