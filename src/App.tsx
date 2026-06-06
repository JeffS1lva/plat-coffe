import { Toaster } from '@/components/ui/sonner';
import { CoffeePlatform } from "./componente/CoffeePlatform";

export function App() {
  return (
    <div>
      <CoffeePlatform />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
