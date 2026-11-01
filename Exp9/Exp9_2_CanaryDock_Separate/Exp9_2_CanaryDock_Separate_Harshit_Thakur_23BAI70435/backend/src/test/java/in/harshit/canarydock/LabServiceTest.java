package in.harshit.canarydock;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class LabServiceTest {

    @Test
    void healthyReleaseAndRollback() {
        LabService s = new LabService();
        s.action("start", "v2.0.0");
        assertThrows(ResponseStatusException.class, () -> s.action("advance", null));
        s.action("traffic", null);
        assertEquals(50, s.action("advance", null).get("weight"));
        assertThrows(ResponseStatusException.class, () -> s.action("advance", null));
        s.action("traffic", null);
        assertEquals("v2.0.0", s.action("advance", null).get("stable"));
        assertEquals("v1.0.0", s.action("rollback", null).get("stable"));
    }

    @Test
    void failureAutomaticallyRollsBack() {
        LabService s = new LabService();
        s.action("start", "v1.2.0");
        s.action("fault", null);
        var state = s.action("traffic", null);
        assertEquals("ROLLED_BACK", state.get("phase"));
        assertEquals(0, state.get("weight"));
        assertEquals(10, state.get("failures"));
    }

    @Test
    void invalidTransitions() {
        LabService s = new LabService();
        assertThrows(ResponseStatusException.class, () -> s.action("traffic", null));
        assertThrows(ResponseStatusException.class, () -> s.action("start", "oops"));
        assertThrows(ResponseStatusException.class, () -> s.action("start", "v1.0.0"));
    }

    @Test
    void resetClearsCounters() {
        LabService s = new LabService();
        s.action("start", "v1.1.0");
        s.action("traffic", null);
        var state = s.action("reset", null);
        assertEquals(0, state.get("canaryHits"));
        assertEquals("READY", state.get("phase"));
    }
}
