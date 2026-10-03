import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          py: 4,
        }}
      >
        <Stack
          spacing={4}
          sx={{
            width: "100%",
          }}
        >
          <Box
            sx={{
              textAlign: "center",
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: {
                  xs: "2.5rem",
                  sm: "3.5rem",
                },
              }}
            >
              Pas&apos;dArt
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                mt: 1,
              }}
            >
              Cup- och turneringssystem
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
            <Stack spacing={2}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                }}
              >
                Redo för nästa cup?
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                Skapa lag, generera spelschema och följ resultat och tabell
                live.
              </Typography>

              <Button variant="contained" size="large" fullWidth>
                Skapa ny cup
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
