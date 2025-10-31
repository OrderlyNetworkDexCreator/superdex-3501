import { useState, useEffect } from "react";
import { SimpleDialog } from "@orderly.network/ui";
import { getRuntimeConfig, getRuntimeConfigBoolean, getRuntimeConfigArray } from "@/utils/runtime-config";

const SERVICE_DISCLAIMER_KEY = "orderly_service_disclaimer_accepted";

interface ServiceDisclaimerDialogProps {
	isRestricted: boolean;
}

const ServiceDisclaimerDialog = ({ isRestricted }: ServiceDisclaimerDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const enableDialog = getRuntimeConfigBoolean('VITE_ENABLE_SERVICE_DISCLAIMER_DIALOG');
	const restrictedRegions = getRuntimeConfigArray('VITE_RESTRICTED_REGIONS') || [];
	const shouldShowDialog = enableDialog || restrictedRegions.length > 0;

	useEffect(() => {
		if (!shouldShowDialog) return;
		
		const hasAccepted = localStorage.getItem(SERVICE_DISCLAIMER_KEY);
		if (!hasAccepted) {
			setIsOpen(true);
		}
	}, [shouldShowDialog]);

	if (!shouldShowDialog) {
		return null;
	}

	const handleAgree = () => {
		localStorage.setItem(SERVICE_DISCLAIMER_KEY, "true");
		setIsOpen(false);
	};

	const formatRestrictedRegionsList = (regions: string[]): string => {
		if (regions.length === 0) return "";
		if (regions.length === 1) return regions[0];
		if (regions.length === 2) return `${regions[0]} and ${regions[1]}`;
		return `${regions.slice(0, -1).join(", ")} and ${regions[regions.length - 1]}`;
	};

	const restrictedRegionsList = formatRestrictedRegionsList(restrictedRegions);
	const hasRestrictedRegions = restrictedRegions.length > 0;

	const actions = {
		primary: {
			label: isRestricted ? "IP Restricted" : "Agree and proceed",
			onClick: handleAgree,
			disabled: isRestricted
		}
	};

	const title = hasRestrictedRegions ? "Service Access Restrictions" : "Service Disclaimer";

	const content = {
		intro: `${getRuntimeConfig('VITE_ORDERLY_BROKER_NAME')} uses Orderly Network's white-label solution and is not a direct operator of the orderbook.`,
		restrictionsTitle: "Usage Restrictions:",
		restrictions: [
			`Users from restricted regions including ${restrictedRegionsList} cannot use this service.`,
			"Access through VPN or other circumvention methods is prohibited. Attempts to access from restricted regions may result in account suspension, and regional restrictions must always be complied with."
		],
		disclaimer: `By clicking 'Agree', users will access a third-party website using Orderly software. ${getRuntimeConfig('VITE_ORDERLY_BROKER_NAME')} confirms that it does not directly operate or control the infrastructure or take responsibility for code operations.`
	};

	return (
		<SimpleDialog
			open={isOpen}
			onOpenChange={setIsOpen}
			title=""
			size="sm"
			closable={false}
			actions={actions}
		>
			<div className="space-y-6">
				<h2 className="text-xl font-semibold text-white">
					{title}
				</h2>

				<p className="text-sm text-white/90 leading-relaxed">
					{content.intro}
				</p>

				{hasRestrictedRegions && (
					<div>
						<h4 className="font-semibold text-white mb-3">{content.restrictionsTitle}</h4>
						<ul className="text-sm text-white/90 space-y-2 list-disc pl-5 leading-relaxed">
							{content.restrictions.map((restriction, index) => (
								<li key={index}>{restriction}</li>
							))}
						</ul>
					</div>
				)}

				<p className="text-sm text-white/80 leading-relaxed border-t border-white/20 pt-4">
					{content.disclaimer}
				</p>
			</div>
		</SimpleDialog>
	);
};

export default ServiceDisclaimerDialog;
