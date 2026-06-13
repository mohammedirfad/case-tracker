import FactCheckIcon from "@mui/icons-material/FactCheck";
import { Avatar } from "@mui/material";

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: "primary.main",
        color: "white",
        boxShadow: "0 10px 28px rgba(21, 94, 117, 0.28)"
      }}
    >
      <FactCheckIcon sx={{ fontSize: Math.round(size * 0.55) }} />
    </Avatar>
  );
}
