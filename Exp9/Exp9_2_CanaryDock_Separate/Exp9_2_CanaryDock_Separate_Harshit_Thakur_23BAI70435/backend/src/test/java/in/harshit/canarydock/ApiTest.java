package in.harshit.canarydock;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ApiTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void healthAndIdentity() throws Exception {
        mvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));

        mvc.perform(get("/api/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.author").value("Harshit Thakur"))
                .andExpect(jsonPath("$.uid").value("23BAI70435"));

        mvc.perform(get("/api/hello"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Release-Slot", "local"))
                .andExpect(header().string("X-Student-UID", "23BAI70435"));
    }

    @Test
    void invalidAction() throws Exception {
        mvc.perform(post("/api/lab").contentType("application/json").content("{}"))
                .andExpect(status().isBadRequest());
    }
}
