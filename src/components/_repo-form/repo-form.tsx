"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/components/ui/repo-form.module.css";
import {
  DocumentDuplicateIcon,
  XMarkIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

type RepoFormProps = {
  sellerName: string;
  sellerEmail: string;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

function useLookupSuggestions(type: "client" | "company", value: string) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const query = value.trim();

    if (query.length < 1) {
      setItems([]);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/lookups?type=${type}&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setItems([]);
          return;
        }

        const data = (await response.json()) as { items?: string[] };
        setItems(data.items ?? []);
      } catch {
        setItems([]);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [type, value]);

  return items;
}

export default function RepoForm({ sellerName, sellerEmail }: RepoFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const clientSuggestions = useLookupSuggestions("client", clientName);
  const companySuggestions = useLookupSuggestions("company", companyName);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    setFiles((prev) => {
      const existingKeys = new Set(
        prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
      );

      const uniqueNewFiles = newFiles.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        return !existingKeys.has(key);
      });

      return [...prev, ...uniqueNewFiles];
    });

    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setFeedback(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.set("clientName", clientName.trim());
    formData.set("companyName", companyName.trim());

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: data.message || "No fue posible crear el repositorio.",
        });
        setIsSubmitting(false);
        return;
      }

      setFeedback({
        type: "success",
        message: data.message || "Repositorio creado correctamente.",
      });

      form.reset();
      setFiles([]);
      setClientName("");
      setCompanyName("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error enviando formulario:", error);

      setFeedback({
        type: "error",
        message:
          "Ocurrió un problema de conexión al intentar crear el repositorio.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Nuevo Repositorio</h2>
        <p className={styles.formSubtitle}>
          Llene los campos requeridos y suba la documentación.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Vendedor</label>
            <input
              type="text"
              value={`${sellerName} (${sellerEmail})`}
              className={styles.input}
              disabled
              readOnly
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="submitName">Nombre del Repositorio</label>
            <input
              id="submitName"
              name="submitName"
              type="text"
              placeholder="Ej: coresa-infra-v1"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="clientName">Cliente</label>
            <input
              id="clientName"
              name="clientName"
              type="text"
              list="client-suggestions"
              placeholder="Nombre del cliente"
              className={styles.input}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <datalist id="client-suggestions">
              {clientSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className={styles.field}>
            <label htmlFor="companyName">Empresa</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              list="company-suggestions"
              placeholder="Empresa asociada"
              className={styles.input}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <datalist id="company-suggestions">
              {companySuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>
        </div>

        <div className={styles.fieldFull}>
          <label htmlFor="description">Descripción del Repositorio</label>
          <textarea
            id="description"
            name="description"
            placeholder="Detalles adicionales..."
            className={styles.textarea}
            rows={4}
          />
        </div>

        <div className={styles.fieldFull}>
          <label>Documentación (PDFs)</label>
          <div className={styles.dropzone}>
            <DocumentDuplicateIcon className={styles.uploadIcon} />
            <p>
              Arrastra tus archivos PDF aquí o <span>haz clic para subir</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              className={styles.fileInput}
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div className={styles.fileList}>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className={styles.fileItem}
                >
                  <div className={styles.fileInfo}>
                    <DocumentIcon className={styles.fileIcon} />
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className={styles.removeBtn}
                  >
                    <XMarkIcon className={styles.closeIcon} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {feedback && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: feedback.type === "success" ? "#166534" : "#991b1b",
              backgroundColor:
                feedback.type === "success" ? "#dcfce7" : "#fee2e2",
              border:
                feedback.type === "success"
                  ? "1px solid #86efac"
                  : "1px solid #fca5a5",
            }}
          >
            {feedback.message}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando repositorio..." : "Crear Repositorio"}
          </button>
        </div>
      </form>
    </div>
  );
}
