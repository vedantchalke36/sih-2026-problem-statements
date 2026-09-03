"use client";

import { PencilEdit } from "@/components/icons/geist";
import { useTranslations } from "@/components/messages-provider";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "@/hooks/use-notes";

export function NotesDialog({ psNumber, title }: { psNumber: string; title: string }) {
  const { getNote, setNote, clearNote } = useNotes();
  const t = useTranslations("notes");
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const openDialog = (isOpen: boolean) => {
    if (isOpen && !loaded) {
      setText(getNote(psNumber));
      setLoaded(true);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={openDialog}>
      <DialogTrigger
        render={<Button variant="outline" size="sm">{t("save")}</Button>}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { id: psNumber })}</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          className="min-h-40"
        />
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={!getNote(psNumber)}
            onClick={() => {
              clearNote(psNumber);
              setText("");
              toast.success(t("cleared"));
            }}
          >
            Clear
          </Button>
          <Button
            onClick={() => {
              setNote(psNumber, text);
              toast.success(t("saved"));
              setOpen(false);
            }}
          >
            <PencilEdit className="size-4" />
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
