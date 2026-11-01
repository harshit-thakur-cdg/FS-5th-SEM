package in.harshit.observatory;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BuildRunServiceTest {

    @Mock
    private BuildRunRepository repository;

    @InjectMocks
    private BuildRunService service;

    @Test
    void trimsAndSaves() {
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));
        assertEquals("Add tests", service.createBuild("  Add tests  ").getCommitMessage());
        verify(repository).save(any());
    }

    @Test
    void rejectsNull() {
        assertThrows(IllegalArgumentException.class, () -> service.createBuild(null));
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsBlank() {
        assertThrows(IllegalArgumentException.class, () -> service.createBuild("  "));
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsTooLong() {
        assertThrows(IllegalArgumentException.class, () -> service.createBuild("x".repeat(201)));
        verifyNoInteractions(repository);
    }

    @Test
    void acceptsBoundary() {
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));
        assertEquals(200, service.createBuild("x".repeat(200)).getCommitMessage().length());
    }

    @Test
    void getsExisting() {
        BuildRun run = new BuildRun("Test");
        when(repository.findById(1L)).thenReturn(Optional.of(run));
        assertSame(run, service.getBuild(1));
    }

    @Test
    void missingIs404() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertEquals(404, assertThrows(ResponseStatusException.class, () -> service.getBuild(99)).getStatusCode().value());
    }

    @Test
    void listsNewestFirst() {
        when(repository.findAll(any(Sort.class))).thenReturn(List.of());
        assertTrue(service.getBuilds().isEmpty());
        verify(repository).findAll(Sort.by(Sort.Direction.DESC, "id"));
    }
}
