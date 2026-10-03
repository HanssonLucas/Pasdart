"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

type Player = {
  id: number;
  name: string;
};

export default function NewTournamentPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("Onsdagscup");
  const [teamMode, setTeamMode] = useState("doubles");
  const [gameType, setGameType] = useState("501");
  const [groupBestOf, setGroupBestOf] = useState("3");
  const [playoffBestOf, setPlayoffBestOf] = useState("5");
  const [groupMaxDarts, setGroupMaxDarts] = useState("39");
  const [playoffMaxDarts, setPlayoffMaxDarts] = useState("39");
  const [roundRobinType, setRoundRobinType] = useState("single");
  const [boardCount, setBoardCount] = useState("2");
  const [tiebreakMethod, setTiebreakMethod] = useState("castoff");

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
          setLoadingPlayers(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function togglePlayer(playerId: number) {
    setSelectedPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId],
    );
  }
  async function handleContinue() {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          gameType,
          teamMode,
          roundRobinType,
          groupBestOf,
          playoffBestOf,
          groupMaxDarts,
          playoffMaxDarts,
          boardCount,
          tiebreakMethod,
          playerIds: selectedPlayerIds,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      router.push(`/tournaments/${data.publicId}/teams`);
    } catch {
      setError("Kunde inte skapa cupen.");
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
              Skapa ny cup
            </Typography>

            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
              Välj spelare och inställningar för kvällens cup.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={3}>
              <TextField
                label="Cupnamn"
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
              />

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Spelare
                </Typography>

                {loadingPlayers ? (
                  <Typography sx={{ color: "text.secondary" }}>
                    Hämtar spelare...
                  </Typography>
                ) : players.length === 0 ? (
                  <Typography sx={{ color: "text.secondary" }}>
                    Inga spelare finns sparade ännu.
                  </Typography>
                ) : (
                  <FormGroup>
                    {players.map((player) => (
                      <FormControlLabel
                        key={player.id}
                        control={
                          <Checkbox
                            checked={selectedPlayerIds.includes(player.id)}
                            onChange={() => togglePlayer(player.id)}
                          />
                        }
                        label={player.name}
                      />
                    ))}
                  </FormGroup>
                )}
              </Box>

              <FormControl>
                <FormLabel>Spelläge</FormLabel>
                <RadioGroup
                  row
                  value={teamMode}
                  onChange={(event) => setTeamMode(event.target.value)}
                >
                  <FormControlLabel
                    value="singles"
                    control={<Radio />}
                    label="Singel"
                  />
                  <FormControlLabel
                    value="doubles"
                    control={<Radio />}
                    label="Dubbel"
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                select
                label="Spel"
                value={gameType}
                onChange={(event) => setGameType(event.target.value)}
                fullWidth
              >
                <MenuItem value="301">301</MenuItem>
                <MenuItem value="501">501</MenuItem>
              </TextField>

              <TextField
                select
                label="Gruppspel - bäst av"
                value={groupBestOf}
                onChange={(event) => setGroupBestOf(event.target.value)}
                fullWidth
              >
                <MenuItem value="1">1 leg</MenuItem>
                <MenuItem value="3">3 legs</MenuItem>
                <MenuItem value="5">5 legs</MenuItem>
                <MenuItem value="7">7 legs</MenuItem>
                <MenuItem value="9">9 legs</MenuItem>
              </TextField>

              <TextField
                select
                label="Slutspel - bäst av"
                value={playoffBestOf}
                onChange={(event) => setPlayoffBestOf(event.target.value)}
                fullWidth
              >
                <MenuItem value="1">1 leg</MenuItem>
                <MenuItem value="3">3 legs</MenuItem>
                <MenuItem value="5">5 legs</MenuItem>
                <MenuItem value="7">7 legs</MenuItem>
                <MenuItem value="9">9 legs</MenuItem>
              </TextField>

              <TextField
                label="Gruppspel - max darts"
                type="number"
                value={groupMaxDarts}
                onChange={(event) => setGroupMaxDarts(event.target.value)}
                fullWidth
              />

              <TextField
                label="Slutspel - max darts"
                type="number"
                value={playoffMaxDarts}
                onChange={(event) => setPlayoffMaxDarts(event.target.value)}
                fullWidth
              />

              <FormControl>
                <FormLabel>Möten</FormLabel>
                <RadioGroup
                  row
                  value={roundRobinType}
                  onChange={(event) => setRoundRobinType(event.target.value)}
                >
                  <FormControlLabel
                    value="single"
                    control={<Radio />}
                    label="Enkelmöte"
                  />
                  <FormControlLabel
                    value="double"
                    control={<Radio />}
                    label="Dubbelmöte"
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                select
                label="Antal tavlor"
                value={boardCount}
                onChange={(event) => setBoardCount(event.target.value)}
                fullWidth
              >
                <MenuItem value="1">1 tavla</MenuItem>
                <MenuItem value="2">2 tavlor</MenuItem>
                <MenuItem value="3">3 tavlor</MenuItem>
              </TextField>

              <FormControl>
                <FormLabel>Vid lika placering</FormLabel>
                <RadioGroup
                  value={tiebreakMethod}
                  onChange={(event) => setTiebreakMethod(event.target.value)}
                >
                  <FormControlLabel
                    value="castoff"
                    control={<Radio />}
                    label="Castoff"
                  />
                  <FormControlLabel
                    value="leg_difference"
                    control={<Radio />}
                    label="Leg difference"
                  />
                </RadioGroup>
              </FormControl>

              <Button
                variant="contained"
                size="large"
                disabled={selectedPlayerIds.length < 2 || saving}
                onClick={handleContinue}
              >
                {saving ? "Skapar cup..." : "Fortsätt"}
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
