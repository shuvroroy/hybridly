import { debounce, debug } from '@hybridly/utils'
import { stringify, parse } from 'superjson'
import { SCROLL_REGION_ATTRIBUTE } from '../constants'
import type { InternalRouterContext, RouterContextOptions, Serializer } from '../context'
import { getInternalRouterContext, getRouterContext, setContext } from '../context'
import { runHooks } from '../plugins'
import { saveScrollPositions } from '../scroll'
import { makeUrl } from '../url'
import type { HybridPayload } from '../router'
import { navigate } from './router'

type SerializedContext = Omit<InternalRouterContext, 'adapter' | 'serializer' | 'plugins' | 'hooks' | 'axios' | 'routes'>

/** Puts the given context into the history state. */
export function setHistoryState(options: HistoryOptions = {}) {
	if (!window?.history) {
		throw new Error('The history API is not available, so Hybridly cannot operate.')
	}

	const context = getRouterContext()
	const method = options.replace
		? 'replaceState'
		: 'pushState'

	const serialized = serializeContext(context)

	debug.history('Setting history state:', {
		method,
		context,
		// serialized,
	})

	try {
		window.history[method](serialized, '', context.url)
	} catch (error) {
		console.error('Hybridly could not save its current state in the history. This is most likely due to a property being non-serializable, such as a proxy or a reference.')
		throw error
	}
}

/** Gets the current history data if it exists. */
export function getHistoryState(): SerializedContext | undefined {
	return getRouterContext()
		.serializer
		.unserialize<SerializedContext>(window.history.state)
}

/** Gets the current history state if it exists. */
export function getHistoryMemo<T = any>(key?: string): T {
	const state = getHistoryState()
	return key
		? state?.memo?.[key] as T
		: state?.memo as T
}

/** Register history-related event listeneners. */
export async function registerEventListeners() {
	const context = getRouterContext()
	debug.history('Registering [popstate] and [scroll] event listeners.')

	// Popstate is for catching back and forward navigations. We want
	// to imitate native browser behavior while keeping the SPA feeling.
	window?.addEventListener('popstate', async(event) => {
		debug.history('Navigation detected (popstate event). State:', { state: event.state })

		// Abort any active navigation.
		if (context.pendingNavigation) {
			debug.router('Aborting current navigation.', context.pendingNavigation)
			context.pendingNavigation?.controller?.abort()
		}

		const state = context.serializer.unserialize<SerializedContext>(event.state)
		await runHooks('backForward', {}, state, context)

		// If there is no state in this history entry, we come from the user
		// replacing the URL manually. In this case, we want to restore everything
		// like it was. We need to copy the hash if any and restore the scroll positions.
		if (!state) {
			debug.history('There is no state. Adding hash if any and restoring scroll positions.')

			return await navigate({
				payload: {
					...context,
					url: makeUrl(context.url, { hash: window.location.hash }).toString(),
				},
				preserveScroll: true,
				preserveState: true,
				replace: true,
			})
		}

		// If the history entry has been tempered with, we want
		// to use it. We swap the components accordingly.
		await navigate({
			payload: state,
			preserveScroll: true,
			preserveState: !!getInternalRouterContext().dialog || !!state.dialog,
			updateHistoryState: false,
			isBackForward: true,
		})
	})

	// On scroll, we want to save the positions of all scrollbars.
	// This is needed in order to restore them upon navigation.
	window?.addEventListener('scroll', (event) => debounce(() => {
		if ((event?.target as Element)?.hasAttribute?.(SCROLL_REGION_ATTRIBUTE)) {
			saveScrollPositions()
		}
	}, 100), true)
}

/** Checks if the current navigation was made by going back or forward. */
export function isBackForwardNavigation(): boolean {
	if (!window.history.state) {
		return false
	}

	return (window.performance?.getEntriesByType('navigation').at(0) as PerformanceNavigationTiming)?.type === 'back_forward'
}

/** Handles a navigation which was going back or forward. */
export async function handleBackForwardNavigation(): Promise<void> {
	debug.router('Handling a back/forward navigation from an external URL.')

	const context = getRouterContext()
	const state = getHistoryState()

	if (!state) {
		throw new Error('Tried to handling a back/forward navigation, but there was no state in the history. This should not happen.')
	}

	await navigate({
		payload: {
			...state satisfies HybridPayload,
			version: context.version,
		},
		preserveScroll: true,
		preserveState: false,
		updateHistoryState: false,
		isBackForward: true,
	})
}

/** Saves a value into the current history state. */
export function remember<T = any>(key: string, value: T): void {
	debug.history(`Remembering key "${key}" with value`, value)

	// We avoid propagation in order to not trigger a recursive
	// render by telling the adapter we updated.
	setContext({
		memo: {
			...getHistoryMemo(),
			[key]: value,
		},
	}, { propagate: false })

	setHistoryState({ replace: true })
}

/** Serializes the context so it can be written to the history state. */
export function serializeContext(context: InternalRouterContext): string {
	return context.serializer.serialize<SerializedContext>({
		url: context.url,
		version: context.version,
		view: context.view,
		dialog: context.dialog,
		scrollRegions: context.scrollRegions,
		memo: context.memo,
	})
}

export function createSerializer(options: RouterContextOptions): Serializer {
	if (options.serializer) {
		return options.serializer
	}

	return {
		serialize: (data) => {
			debug.history('Serializing data.', data)
			return stringify(data)
		},
		unserialize: (data) => {
			if (!data) {
				debug.history('No data to unserialize.')
				return
			}

			return parse(data)
		},
	}
}

export interface HistoryOptions {
	/**
	 * Replace the current history entry instead of pushing a new entry.
	 * @default false
	 */
	replace?: boolean
}
