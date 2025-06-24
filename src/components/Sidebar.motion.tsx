import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTheme } from "./ThemeProvider";
import { FaSitemap, FaSun, FaMoon } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
	{
		to: "/bst",
		label: "Binary search trees",
		Icon: FaSitemap,
		aria: "Tree structure",
	},
];

export default function Sidebar() {
	const { prefersDarkMode, toggleTheme } = useTheme();
	const [hovered, setHovered] = useState<string | null>(null);
	const linkBase =
		"relative flex items-center gap-3 no-underline hover:text-blue-400 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200";
	const linkText = "text-zinc-900 dark:text-zinc-100";

	return (
		<aside className="w-80 h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col p-6 box-border">
			<div className="font-bold text-2xl mb-8 flex items-center justify-between">
				<span className="font-sans-tight font-extrabold">Structures</span>
				<label className="ml-4 flex items-center cursor-pointer select-none">
					<input
						type="checkbox"
						checked={prefersDarkMode}
						onChange={toggleTheme}
						className="sr-only"
						aria-label="Toggle dark/light mode"
					/>
					<span className="w-10 h-6 flex items-center bg-gray-400 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300">
						<span
							className={`w-4 h-4 bg-white dark:bg-zinc-900 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
								prefersDarkMode ? "translate-x-4" : ""
							}`}
						>
							{prefersDarkMode ? (
								<FaMoon
									className="text-gray-700 dark:text-yellow-300"
									size={10}
								/>
							) : (
								<FaSun className="text-yellow-400" size={10} />
							)}
						</span>
					</span>
				</label>
			</div>
			<nav className="flex flex-col gap-5">
				{navItems.map(({ to, label, Icon, aria }) => (
					<div
						key={to}
						className="relative"
						onMouseEnter={() => setHovered(to)}
						onMouseLeave={() => setHovered(null)}
					>
						<AnimatePresence>
							{hovered === to && (
								<motion.div
									layoutId="sidebar-hover-bg"
									initial={{ opacity: 0, scale: 0.98 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.98 }}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 30,
									}}
									className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 rounded-lg z-0"
								/>
							)}
						</AnimatePresence>
						<Link
							to={to}
							className={`${linkBase} ${linkText} z-10`}
							tabIndex={0}
						>
							<Icon aria-label={aria} />
							{label}
						</Link>
					</div>
				))}
			</nav>
		</aside>
	);
}
