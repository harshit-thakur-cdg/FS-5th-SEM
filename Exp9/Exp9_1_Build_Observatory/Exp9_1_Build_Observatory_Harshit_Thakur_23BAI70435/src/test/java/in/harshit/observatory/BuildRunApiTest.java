package in.harshit.observatory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class BuildRunApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private BuildRunRepository repository;

    @BeforeEach
    void reset() {
        repository.deleteAll();
    }

    @Test
    void createsAndRetrieves() throws Exception {
        mvc.perform(post("/api/builds")
                .contentType("application/json")
                .content("{\"commitMessage\":\"  Add CI tests  \"}"))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.commitMessage").value("Add CI tests"))
                .andExpect(jsonPath("$.status").value("QUEUED"));

        long id = repository.findAll().get(0).getId();

        mvc.perform(get("/api/builds/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));

        mvc.perform(get("/api/builds"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void rejectsBlank() throws Exception {
        mvc.perform(post("/api/builds")
                .contentType("application/json")
                .content("{\"commitMessage\":\" \"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsMissingField() throws Exception {
        mvc.perform(post("/api/builds")
                .contentType("application/json")
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsLong() throws Exception {
        mvc.perform(post("/api/builds")
                .contentType("application/json")
                .content("{\"commitMessage\":\"" + "x".repeat(201) + "\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsMalformedJson() throws Exception {
        mvc.perform(post("/api/builds")
                .contentType("application/json")
                .content("{"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void missingIs404() throws Exception {
        mvc.perform(get("/api/builds/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void emptyList() throws Exception {
        mvc.perform(get("/api/builds"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }
}
