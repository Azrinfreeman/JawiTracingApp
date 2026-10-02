export const initialTraceState = { mode: 'play', activity: 'trace', demo: false, assistance: 0, retries: 0, attempt: 0 };
export function traceReducer(state, event) {
  switch (event.type) {
    case 'DEMO': return { ...state, demo: true, assistance: state.assistance + 1, attempt: state.attempt + (state.mode === 'play' ? 0 : 1) };
    case 'DEMO_END': return { ...state, demo: false };
    case 'RETRY': return { ...state, demo: false, retries: state.retries + 1, attempt: state.attempt + 1 };
    case 'MODE': return { ...state, mode: event.mode, demo: false, attempt: state.attempt + 1 };
    case 'COPY': return { ...state, activity: 'copy', demo: false, attempt: state.attempt + 1 };
    case 'TRACE': return { ...state, activity: 'trace', demo: false, attempt: state.attempt + 1 };
    default: return state;
  }
}
