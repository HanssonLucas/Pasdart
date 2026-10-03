"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Player = {
  id: number;
  name: string;
  createdAt: string;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/players")
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setPlayers(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Kunde inte hämta spelare.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Skriv in ett namn.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const newPlayer = await response.json();

      setPlayers((currentPlayers) => [...currentPlayers, newPlayer]);
      setName("");
    } catch {
      setError("Kunde inte lägga till spelaren.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Spelare
            </Typography>

            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
              Lägg till spelare som kan användas i framtida cuper.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <TextField
                label="Spelarens namn"
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving}
              >
                {saving ? "Lägger till..." : "Lägg till spelare"}
              </Button>
            </Stack>
          </Paper>

          {error && <Alert severity="error">{error}</Alert>}

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Sparade spelare
            </Typography>

            {loading ? (
              <Typography sx={{ color: "text.secondary" }}>
                Hämtar spelare...
              </Typography>
            ) : players.length === 0 ? (
              <Typography sx={{ color: "text.secondary" }}>
                Inga spelare sparade ännu.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {players.map((player) => (
                  <Box
                    key={player.id}
                    sx={{
                      px: 2,
                      py: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Typography>{player.name}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
