import { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Input, VStack, HStack, Text, IconButton, useToast } from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt } from "react-icons/fa";

const API_URL = "http://localhost:1337/api";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [promptName, setPromptName] = useState("");
  const [promptText, setPromptText] = useState("");
  const [editingPromptId, setEditingPromptId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchPrompts(token);
    }
  }, []);

  const login = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchPrompts(data.jwt);
      } else {
        toast({
          title: "Login failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const register = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        toast({
          title: "Registration successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Registration failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const fetchPrompts = async (token) => {
    try {
      const response = await fetch(`${API_URL}/prompts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      } else {
        console.error("Failed to fetch prompts");
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
    }
  };

  const createPrompt = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: promptName, prompt: promptText }),
      });

      if (response.ok) {
        const newPrompt = await response.json();
        setPrompts([...prompts, newPrompt]);
        setPromptName("");
        setPromptText("");
        toast({
          title: "Prompt created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to create prompt",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error creating prompt:", error);
    }
  };

  const updatePrompt = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/prompts/${editingPromptId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: promptName, prompt: promptText }),
      });

      if (response.ok) {
        const updatedPrompt = await response.json();
        setPrompts(prompts.map((prompt) => (prompt.id === updatedPrompt.id ? updatedPrompt : prompt)));
        setEditingPromptId(null);
        setPromptName("");
        setPromptText("");
        toast({
          title: "Prompt updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to update prompt",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error updating prompt:", error);
    }
  };

  const deletePrompt = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/prompts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPrompts(prompts.filter((prompt) => prompt.id !== id));
        toast({
          title: "Prompt deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to delete prompt",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting prompt:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setPrompts([]);
  };

  if (!isLoggedIn) {
    return (
      <Box p={4}>
        <VStack spacing={4}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button onClick={login}>Login</Button>
          <Text>
            Don't have an account?{" "}
            <Button variant="link" onClick={() => setEmail("")}>
              Register
            </Button>
          </Text>
          {email !== "" && (
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button mt={2} onClick={register}>
                Register
              </Button>
            </FormControl>
          )}
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="2xl">Prompts</Text>
        <IconButton icon={<FaSignOutAlt />} aria-label="Logout" onClick={logout} />
      </HStack>
      <VStack spacing={4} align="stretch">
        {prompts.map((prompt) => (
          <Box key={prompt.id} borderWidth={1} borderRadius="md" p={2}>
            <HStack justify="space-between">
              <Text fontWeight="bold">{prompt.name}</Text>
              <HStack>
                <IconButton
                  icon={<FaEdit />}
                  aria-label="Edit"
                  onClick={() => {
                    setEditingPromptId(prompt.id);
                    setPromptName(prompt.name);
                    setPromptText(prompt.prompt);
                  }}
                />
                <IconButton icon={<FaTrash />} aria-label="Delete" onClick={() => deletePrompt(prompt.id)} />
              </HStack>
            </HStack>
            <Text>{prompt.prompt}</Text>
          </Box>
        ))}
      </VStack>
      <VStack mt={4} spacing={2}>
        <FormControl>
          <FormLabel>Prompt Name</FormLabel>
          <Input type="text" value={promptName} onChange={(e) => setPromptName(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Prompt Text</FormLabel>
          <Input type="text" value={promptText} onChange={(e) => setPromptText(e.target.value)} />
        </FormControl>
        <Button leftIcon={<FaPlus />} onClick={editingPromptId ? updatePrompt : createPrompt}>
          {editingPromptId ? "Update Prompt" : "Create Prompt"}
        </Button>
      </VStack>
    </Box>
  );
};

export default Index;
