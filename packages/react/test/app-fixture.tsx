import { useState } from "react";
import { createRoot } from "react-dom/client";
import { ChatProvider } from "@olorinm/agent-ui";
import {
  Button,
  ConfirmProvider,
  Dialog,
  DialogContent,
  DialogTitle,
  EmployeeAvatar,
  EmptyState,
  ObjectSettingsRow,
  ObjectSettingsSection,
  ProductStatus,
  ToastProvider,
  useConfirm,
  useToast,
} from "@olorinm/agent-ui/app";
import "@olorinm/agent-ui/app.css";

const copy: Record<string, string> = {
  "common.cancel": "取消",
  "common.confirm": "确认",
  "toast.close": "关闭通知",
  "toast.regionLabel": "通知",
};

function Fixture() {
  const confirm = useConfirm();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  return (
    <main className="agent-app">
      <ObjectSettingsSection title="Agents">
        <ObjectSettingsRow
          leading={<EmployeeAvatar seed="agent-1" fallbackName="Helper" />}
          title="Helper"
          value={<ProductStatus tone="success" label="Ready" />}
          onClick={() => setOpen(true)}
        />
      </ObjectSettingsSection>
      <EmptyState illustration="sprout" title="No channels" />
      <Button
        onClick={async () =>
          setResult(String(await confirm({ title: "Destroy environment?", body: "Workspace files are removed.", danger: true })))
        }
      >
        Destroy
      </Button>
      <Button onClick={() => toast({ kind: "success", title: "Agent paused", duration: 0 })}>Notify</Button>
      <Button
        onClick={() => {
          const root = document.documentElement;
          root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
        }}
      >
        Theme
      </Button>
      <output aria-label="Confirm result">{result}</output>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Helper</DialogTitle>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogContent>
      </Dialog>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <ChatProvider translate={(key) => copy[key] ?? key}>
    <ConfirmProvider>
      <ToastProvider>
        <Fixture />
      </ToastProvider>
    </ConfirmProvider>
  </ChatProvider>,
);
