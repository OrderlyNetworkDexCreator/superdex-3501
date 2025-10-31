import { useEffect, useState } from "react";
import { getRuntimeConfigArray } from "@/utils/runtime-config";

function formatRegion(region: string): string {
  return region?.replace(/\s+/g, "").toLowerCase();
}

export const useIpRestriction = () => {
  const [isRestricted, setIsRestricted] = useState<boolean>(false);
  const [ipInfo, setIpInfo] = useState<{ ip: string; region: string } | null>(
    null
  );

  useEffect(() => {
    fetch("https://api.orderly.org/v1/ip_info")
      .then((res) => res.json())
      .then((data) => {
        const userRegion = data?.data?.region || "";
        const userIp = data?.data?.ip || "";
        setIpInfo({ ip: userIp, region: userRegion });

        const restrictedRegions =
          getRuntimeConfigArray("VITE_RESTRICTED_REGIONS") || [];
        const whitelistIps =
          getRuntimeConfigArray("VITE_WHITELISTED_IPS") || [];

        if (whitelistIps.includes(userIp)) {
          setIsRestricted(false);
          return;
        }
        if (restrictedRegions.includes(formatRegion(userRegion))) {
          setIsRestricted(true);
        }
      });
  }, []);

  return { isRestricted, ipInfo };
};
