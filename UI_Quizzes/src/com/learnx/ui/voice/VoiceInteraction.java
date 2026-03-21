package com.learnx.ui.voice;

/**
 * Stub for voice interaction features (Text-to-Speech and Speech-to-Text).
 *
 * <p>Integrate a TTS/STT library here, for example:
 * <ul>
 *   <li><a href="https://freetts.sourceforge.net/">FreeTTS</a> for text-to-speech</li>
 *   <li>Google Cloud Speech-to-Text Java client for speech recognition</li>
 * </ul>
 *
 * <p>Voice features degrade gracefully: if audio hardware is unavailable the
 * methods fall back to console I/O.
 */
public class VoiceInteraction {

    private boolean audioAvailable;

    public VoiceInteraction() {
        this.audioAvailable = detectAudio();
    }

    /**
     * Speaks the given text aloud, or prints it to the console if audio is unavailable.
     *
     * @param text the text to speak
     */
    public void speak(String text) {
        if (audioAvailable) {
            // TODO: integrate TTS library
            System.out.println("[TTS] " + text);
        } else {
            System.out.println(text);
        }
    }

    /**
     * Listens for a spoken answer, or reads from the console if audio is unavailable.
     *
     * @return the recognised text (or empty string on failure)
     */
    public String listen() {
        if (audioAvailable) {
            // TODO: integrate STT library
            System.out.println("[STT] Listening... (not yet implemented, falling back to console)");
        }
        return "";  // Fallback: caller should use Scanner for console input
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private boolean detectAudio() {
        try {
            javax.sound.sampled.AudioSystem.getMixerInfo();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
