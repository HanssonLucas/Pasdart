"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PasdartInlineError from "@/components/PasdartInlineError";
import PasdartLoadingState from "@/components/PasdartLoadingState";

type Player = {
  id: number;
  name: string;
  createdAt: string;
  isActive?: boolean;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");

  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [manageOpen, setManageOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [editName, setEditName] = useState("");
  const [manageError, setManageError] = useState("");
  const [updatingPlayer, setUpdatingPlayer] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
          setLoadError("Kunde inte hämta spelarna. Försök att ladda om sidan.");
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
      setFormError("Skriv in ett namn innan du fortsätter.");
      return;
    }

    setSaving(true);
    setFormError("");

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

      const newPlayer: Player = await response.json();

      setPlayers((currentPlayers) => [...currentPlayers, newPlayer]);
      setName("");
    } catch {
      setFormError("Kunde inte lägga till spelaren. Försök igen om en stund.");
    } finally {
      setSaving(false);
    }
  }

  function resetManageState() {
    setManageOpen(false);
    setSelectedPlayerId("");
    setEditName("");
    setManageError("");
    setConfirmingDelete(false);
  }

  function handleOpenManage() {
    setManageOpen(true);
    setSelectedPlayerId("");
    setEditName("");
    setManageError("");
    setConfirmingDelete(false);
  }

  function handleCloseManage() {
    if (updatingPlayer) {
      return;
    }

    resetManageState();
  }

  function handleSelectPlayer(playerId: string) {
    setSelectedPlayerId(playerId);
    setManageError("");
    setConfirmingDelete(false);

    const player = players.find(
      (currentPlayer) => currentPlayer.id === Number(playerId),
    );

    setEditName(player?.name ?? "");
  }

  async function handleRenamePlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const playerId = Number(selectedPlayerId);
    const selectedPlayer = players.find((player) => player.id === playerId);
    const trimmedName = editName.trim();

    if (!selectedPlayer) {
      setManageError("Välj en spelare först.");
      return;
    }

    if (!trimmedName) {
      setManageError("Spelarens namn får inte vara tomt.");
      return;
    }

    if (trimmedName === selectedPlayer.name) {
      resetManageState();
      return;
    }

    setUpdatingPlayer(true);
    setManageError("");

    try {
      const response = await fetch("/api/players", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: playerId,
          name: trimmedName,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const updatedPlayer: Player = await response.json();

      setPlayers((currentPlayers) =>
        currentPlayers.map((player) =>
          player.id === updatedPlayer.id ? updatedPlayer : player,
        ),
      );

      resetManageState();
    } catch {
      setManageError("Kunde inte spara ändringen. Försök igen om en stund.");
    } finally {
      setUpdatingPlayer(false);
    }
  }

  async function handleDeactivatePlayer() {
    const playerId = Number(selectedPlayerId);
    const selectedPlayer = players.find((player) => player.id === playerId);

    if (!selectedPlayer) {
      setManageError("Välj en spelare först.");
      return;
    }

    setUpdatingPlayer(true);
    setManageError("");

    try {
      const response = await fetch("/api/players", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: playerId,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setPlayers((currentPlayers) =>
        currentPlayers.filter((player) => player.id !== playerId),
      );

      resetManageState();
    } catch {
      setManageError("Kunde inte ta bort spelaren. Försök igen om en stund.");
    } finally {
      setUpdatingPlayer(false);
    }
  }

  const selectedPlayer = players.find(
    (player) => player.id === Number(selectedPlayerId),
  );

  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 1.25,
                backgroundColor: "rgba(255,255,255,0.018)",
              }}
            >
              <Box
                sx={{
                  height: 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 3,
                    backgroundColor: "success.dark",
                  }}
                />

                <Box
                  sx={{
                    width: 28,
                    height: 3,
                    backgroundColor: "error.dark",
                  }}
                />

                <Box
                  sx={{
                    width: 28,
                    height: 3,
                    backgroundColor: "success.dark",
                  }}
                />
              </Box>

              <Box
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "minmax(0, 1fr) auto",
                  },
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontStyle: "italic",
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      color: "rgba(255,255,255,0.82)",
                      lineHeight: 1,
                    }}
                  >
                    Pas d&apos;Art
                  </Typography>

                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      mt: 0.8,
                      fontWeight: 800,
                      letterSpacing: "-0.025em",
                      fontSize: { xs: "2rem", sm: "2.5rem" },
                    }}
                  >
                    Spelare
                  </Typography>

                  <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
                    Lägg till personer som kan användas i kommande cuper.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    minWidth: { sm: 150 },
                    pl: { sm: 2.5 },
                    borderLeft: {
                      xs: "none",
                      sm: "1px solid rgba(255,255,255,0.10)",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "error.light",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    SPELARREGISTER
                  </Typography>

                  <Typography sx={{ mt: 0.25, fontWeight: 800 }}>
                    {players.length} spelare
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.2 }}
                  >
                    Redo för nästa cup
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(280px, 0.8fr) minmax(0, 1.2fr)",
                },
                gap: 2,
                alignItems: "start",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 1,
                  backgroundColor: "rgba(255,255,255,0.014)",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    px: { xs: 2, sm: 2.5 },
                    pt: 2.25,
                    pb: 1.75,
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor: "error.dark",
                    },
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: "error.light",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    NY SPELARE
                  </Typography>

                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Lägg till spelare
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.35 }}
                  >
                    Lägg till spelaren en gång så finns den kvar till framtida
                    cuper.
                  </Typography>
                </Box>

                <Stack
                  component="form"
                  spacing={1.5}
                  onSubmit={handleSubmit}
                  sx={{ p: { xs: 2, sm: 2.5 } }}
                >
                  <TextField
                    label="Spelarens namn"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);

                      if (formError) {
                        setFormError("");
                      }
                    }}
                    fullWidth
                  />

                  {formError && <PasdartInlineError message={formError} />}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={saving}
                    sx={{
                      minHeight: 50,
                      borderRadius: 0.75,
                      boxShadow: "none",
                      fontWeight: 800,
                    }}
                  >
                    {saving ? "Lägger till..." : "Lägg till spelare"}
                  </Button>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 1,
                  backgroundColor: "rgba(255,255,255,0.014)",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    px: { xs: 2, sm: 2.5 },
                    pt: 2.25,
                    pb: 1.75,
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor: "error.dark",
                    },
                  }}
                >
                  <Stack
                    sx={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          color: "error.light",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                        }}
                      >
                        SPARAT
                      </Typography>

                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Spelarregister
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", pb: 0.25, flexShrink: 0 }}
                    >
                      {players.length} totalt
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                  {loading ? (
                    <PasdartLoadingState
                      variant="inline"
                      title="Hämtar spelare"
                      description="Förbereder spelarregistret."
                    />
                  ) : loadError ? (
                    <PasdartInlineError message={loadError} />
                  ) : players.length === 0 ? (
                    <Typography sx={{ color: "text.secondary" }}>
                      Inga spelare sparade ännu.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                          },
                          gap: 1,
                        }}
                      >
                        {players.map((player, index) => (
                          <Box
                            key={player.id}
                            sx={{
                              minHeight: 58,
                              display: "grid",
                              gridTemplateColumns: "36px minmax(0, 1fr)",
                              alignItems: "center",
                              border: "1px solid rgba(255,255,255,0.09)",
                              borderRadius: 0.75,
                              backgroundColor: "rgba(255,255,255,0.01)",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                alignSelf: "stretch",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRight: "1px solid rgba(255,255,255,0.07)",
                                backgroundColor: "rgba(198,40,40,0.045)",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "error.light",
                                  fontWeight: 800,
                                }}
                              >
                                {index + 1}
                              </Typography>
                            </Box>

                            <Typography
                              sx={{
                                px: 1.5,
                                fontWeight: 700,
                                minWidth: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {player.name}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Box
                        sx={{
                          pt: 1.5,
                          borderTop: "1px solid rgba(255,255,255,0.08)",
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={handleOpenManage}
                          disabled={players.length === 0}
                          sx={{
                            width: { xs: "100%", sm: "auto" },
                            minHeight: 42,
                            borderRadius: 0.75,
                            fontWeight: 700,
                          }}
                        >
                          Hantera spelare
                        </Button>
                      </Box>
                    </Stack>
                  )}
                </Box>
              </Paper>
            </Box>
          </Stack>
        </Box>
      </Container>

      <Dialog
        open={manageOpen}
        onClose={handleCloseManage}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              width: "100%",
              maxWidth: 560,
              borderRadius: 1,
              border: "1px solid rgba(255,255,255,0.14)",
              backgroundImage: "none",
              overflow: "hidden",
            },
          },
        }}
      >
        <Box
          sx={{
            height: 3,
            backgroundColor: "error.dark",
          }}
        />

        {confirmingDelete && selectedPlayer ? (
          <>
            <DialogTitle sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: 1 }}>
              <Typography
                sx={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontStyle: "italic",
                  fontSize: "1rem",
                  color: "text.secondary",
                }}
              >
                Pas d&apos;Art
              </Typography>

              <Typography
                component="div"
                variant="h5"
                sx={{ fontWeight: 800, mt: 0.5 }}
              >
                Ta bort {selectedPlayer.name}?
              </Typography>
            </DialogTitle>

            <DialogContent
              sx={{ px: { xs: 2.5, sm: 3.5 }, pt: "8px !important" }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    border: "1px solid rgba(198,40,40,0.28)",
                    borderRadius: 0.75,
                    backgroundColor: "rgba(198,40,40,0.05)",
                    p: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                    Spelaren tas bort från framtida cuper
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", lineHeight: 1.6 }}
                  >
                    {selectedPlayer.name} försvinner från spelarregistret och
                    kan inte väljas i nya cuper. Gamla cuper och resultat
                    påverkas inte.
                  </Typography>
                </Box>

                {manageError && <PasdartInlineError message={manageError} />}
              </Stack>
            </DialogContent>

            <DialogActions
              sx={{
                px: { xs: 2.5, sm: 3.5 },
                pb: 3,
                pt: 1.5,
                gap: 1,
                flexDirection: { xs: "column-reverse", sm: "row" },
              }}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={() => {
                  setConfirmingDelete(false);
                  setManageError("");
                }}
                disabled={updatingPlayer}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: 110,
                }}
              >
                Tillbaka
              </Button>

              <Button
                type="button"
                variant="contained"
                onClick={handleDeactivatePlayer}
                disabled={updatingPlayer}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: 150,
                  backgroundColor: "error.dark",
                  color: "common.white",
                  "&:hover": {
                    backgroundColor: "error.main",
                  },
                }}
              >
                {updatingPlayer ? "Tar bort..." : "Ta bort spelare"}
              </Button>
            </DialogActions>
          </>
        ) : (
          <Stack component="form" onSubmit={handleRenamePlayer}>
            <DialogTitle sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: 1 }}>
              <Typography
                sx={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontStyle: "italic",
                  fontSize: "1rem",
                  color: "text.secondary",
                }}
              >
                Pas d&apos;Art
              </Typography>

              <Typography
                component="div"
                variant="h5"
                sx={{ fontWeight: 800, mt: 0.5 }}
              >
                Hantera spelare
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.6, lineHeight: 1.55 }}
              >
                Välj en spelare för att ändra namn eller ta bort personen från
                framtida cuper.
              </Typography>
            </DialogTitle>

            <DialogContent
              sx={{ px: { xs: 2.5, sm: 3.5 }, pt: "14px !important" }}
            >
              <Stack spacing={2}>
                <TextField
                  select
                  label="Välj spelare"
                  value={selectedPlayerId}
                  onChange={(event) => handleSelectPlayer(event.target.value)}
                  disabled={updatingPlayer}
                  fullWidth
                >
                  {players.map((player) => (
                    <MenuItem key={player.id} value={String(player.id)}>
                      {player.name}
                    </MenuItem>
                  ))}
                </TextField>

                {selectedPlayer && (
                  <>
                    <TextField
                      label="Redigera namn"
                      value={editName}
                      onChange={(event) => {
                        setEditName(event.target.value);

                        if (manageError) {
                          setManageError("");
                        }
                      }}
                      disabled={updatingPlayer}
                      fullWidth
                    />

                    <Box
                      sx={{
                        pt: 1.75,
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => {
                          setConfirmingDelete(true);
                          setManageError("");
                        }}
                        disabled={updatingPlayer}
                        sx={{
                          width: { xs: "100%", sm: "auto" },
                          minWidth: 150,
                          borderColor: "rgba(198,40,40,0.55)",
                          color: "error.light",
                          fontWeight: 700,
                          "&:hover": {
                            borderColor: "error.main",
                            backgroundColor: "rgba(198,40,40,0.06)",
                          },
                        }}
                      >
                        Ta bort spelare
                      </Button>
                    </Box>
                  </>
                )}

                {manageError && <PasdartInlineError message={manageError} />}
              </Stack>
            </DialogContent>

            <DialogActions
              sx={{
                px: { xs: 2.5, sm: 3.5 },
                pb: 3,
                pt: 1.5,
                gap: 1,
                flexDirection: { xs: "column-reverse", sm: "row" },
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={handleCloseManage}
                disabled={updatingPlayer}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: 100,
                }}
              >
                Stäng
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={!selectedPlayer || updatingPlayer}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: 130,
                }}
              >
                {updatingPlayer ? "Sparar..." : "Spara namn"}
              </Button>
            </DialogActions>
          </Stack>
        )}
      </Dialog>
    </>
  );
}
